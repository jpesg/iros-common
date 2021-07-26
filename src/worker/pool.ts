// todo on exit , kill all children

// todo start with children

import type { Modify } from '../utils/modify'
import type { Optional } from 'utility-types'
import logger from '../logger/logger';
import child_process from 'child_process';
import os from 'os';

export enum WorkerState {
  init = 'init',
  waiting = 'waiting',
  preparing = 'preparing',
  working = 'working',
  finish = 'finish'
}

export type WorkerMessage = {
  type: WorkerState
  error: Error
}

export type Module = string
export type Command = string

type Stats = {
  duration: number
  timestamp: number
  error: Error
}

type ConfigTask = {
  module: Module
  command: Command
  delay: number
  stats?: Stats[]
}

type InternalTask = Modify<ConfigTask, {
  timeout: NodeJS.Timeout
}>

type Task
  = ConfigTask
  | InternalTask

export class Worker {
  process;
  status: WorkerState = WorkerState.init;

  module: null | Module = '';
  command: null | Command = '';
  start: null | number = 0;

  onCommandFinished: (module: Module, command: Command, duration: number, error: Error) => unknown;

  end: number = 0;

  constructor() {
    this._reset();
    this.process = child_process.fork(`${__dirname}/worker`);
    this.process.on('message', msg => this.onMessage(msg as WorkerMessage));
    this.onCommandFinished = () => {}
  }

  transition(s: WorkerState) {
    const {status} = this;

    switch (s) {
      case WorkerState.waiting:
        if ([WorkerState.finish, WorkerState.init].includes(status)) {
          return this.status = s;
        }
        break;
      case WorkerState.preparing:
        if (status === WorkerState.waiting) return this.status = s;
        break;
      case WorkerState.working:
        if (status === WorkerState.preparing) return this.status = s;
        break;
      case WorkerState.finish:
        if (status === WorkerState.working) return this.status = WorkerState.waiting;
        break;
    }

    return false;
  }

  exec(module: Module, command: Command) {
    if (this.transition(WorkerState.preparing)) {
      this.module = module;
      this.command = command;
      this.start = this._getTime();
      return this.process.send({type: 'exec', module, command});
    }
  }

  finish(error: null | Error = null) {
    if (this.transition(WorkerState.finish)) {
      this.end = this._getTime();

      if (error) {
          logger.error('command failed', {error, module: this.module, command: this.command});
      }

      if (this.module !== null && this.command !== null) {
        this.onCommandFinished(this.module, this.command, this.end - (this.start ?? 0), error || Error());
      }

      this._reset();
      this.transition(WorkerState.waiting);
    }
  }

  onMessage(e: WorkerMessage) {
    switch (e.type) {
      case WorkerState.waiting:
      case WorkerState.working:
        return this.transition(e.type);
      case WorkerState.finish:
        return this.finish(e.error);
    }
  }

  _getTime() {
    const n = process.hrtime();
    return n[0] * 1000000 + n[1] / 1000;
  }

  _reset() {
    this.module = null;
    this.command = null;
    this.start = null;
  }
}

type Config = {
  tasks?: Record<string, ConfigTask>
  maxWorkers: number
  [key: string]: unknown
}

export default class Pool {
  config: Config = {
    maxWorkers: os.cpus().length,
    tasks: {}
  };

  tasks: InternalTask[] = [];

  workers: Worker[] = [];

  constructor(config: Optional<Config, 'maxWorkers' | 'tasks'> = {}) {
    const _this = this;

    Object.keys(config).forEach(k => {
      if (_this.config[k]) {
        _this.config[k] = config[k];
      }
    });

    this._initWorkers();
    this._initTasks(config.tasks || {});

    if (process.env.NODE_ENV !== 'test') {
      process.on('beforeExit', this.stop);
    }
  }

  stop() {
    this._stopTasks();
    this._stopWorkers();
  }

  _initWorkers() {
    const {config: {maxWorkers}} = this;

    for (let i = 0; i < maxWorkers; i++) {
      this._createWorker();
    }
  }

  _createWorker() {
    const worker = new Worker();
    worker.onCommandFinished = this._taskFinished.bind(this);
    this.workers.push(worker);
  }

  _initTasks(tasks: Record<string, ConfigTask>) {
    const _this = this;

    for (const t in tasks) {
      if (tasks.hasOwnProperty(t)) {
        const {module, command, delay} = tasks[t];

        this.tasks.push({
          module,
          command,
          stats: [],
          delay,
          timeout: setTimeout(() => _this.runTask(module, command), delay),
        });
      }
    }
  }

  runTask(module: Module, command: Command) {
    const worker = this._getAvailableWorker();

    if (!worker) {
      logger.error('failed to get worker');
      return;
    }

    if (this.workers.length !== this.config.maxWorkers) {
      for (let i = 0; i < this.config.maxWorkers - this.workers.length; i++) {
        this._createWorker();
      }
    }

    return worker.exec(module, command);
  }

  _taskFinished(module: Module, command: Command, duration: number, error: Error) {
    const _this = this;

    for (const i in this.tasks) {
      if (this.tasks.hasOwnProperty(i)) {
        const s = this.tasks[i];

        if (s.module === module && s.command === command) {
          if (s.stats) {
            s.stats.push({duration, error, timestamp: Date.now()});
            s.stats = s.stats.slice(-10);
          }

          if (duration > (s.delay * 3)) {
            logger.warn(`This task took too much time.`, {
              task: s,
              duration
            })
          }

          s.timeout = setTimeout(() => {
            _this.runTask(s.module, s.command)
          }, s.delay)

          return;
        }
      }
    }
  }

  _getAvailableWorker() {
    const sorted = this.workers.filter(w => w.status === WorkerState.waiting).sort((a, b) => a.end ^ b.end);

    if (!sorted.length) {
      return;
    }

    return sorted[0];
  }

  _stopTasks() {
    this.tasks.forEach(task => {
      try {
        clearTimeout(task.timeout);
      } catch (e) {
      }
    });
  }

  _stopWorkers() {
    for (const id in this.workers) {
      if (this.workers.hasOwnProperty(id)) {
        try {
          this.workers[id].process.kill();
        } catch (e) {
          logger.error('Failed to stop worker',{e});
        }
      }
    }
  }
}
