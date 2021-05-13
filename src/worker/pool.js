// todo on exit , kill all children

// todo start with children

import logger from '../logger/logger';
import child_process from 'child_process';
import os from 'os';

export class Worker {
  INIT = 'init';
  WAITING = 'waiting';
  PREPARING = 'preparing';
  WORKING = 'working';
  FINISH = 'finish';

  process;
  status = this.INIT;
  // fn ( module, command, duration, error)
  onCommandFinished;

  module;
  command;
  start;

  end = 0;

  constructor() {
    this._reset();
    this.process = child_process.fork(`${__dirname}/worker`);
    this.process.on('message', msg => this.onMessage(msg));
  }

  transition(s) {
    const {INIT, WAITING, PREPARING, WORKING, FINISH, status} = this;

    switch (s) {
      case WAITING:
        if ([FINISH, INIT].indexOf(status) > 0) return this.status = s;
        break;

      case PREPARING:
        if (status === WAITING) return this.status = s;
        break;

      case WORKING:
        if (status === PREPARING) return this.status = s;
        break;

      case FINISH:
        if (status === WORKING) return this.status = WAITING;
        break;

    }

    return false;
  }

  exec(module, command) {
    if (this.transition(this.PREPARING)) {
      this.module = module;
      this.command = command;
      this.start = this._getTime();
      return this.process.send({type: 'exec', module, command});
    }
  }

  finish(error = null) {
    if (this.transition(this.FINISH)) {
      this.end = this._getTime();

      if (error) logger.error('command failed', {error, module: this.module, command: this.command});

      if (typeof this.onCommandFinished === 'function') {
        this.onCommandFinished(this.module, this.command, this.end - this.start, error);
      }

      this._reset();
      this.transition(this.WAITING);
    }
  }

  onMessage(e) {
    switch (e.type) {
      case this.WAITING:
      case this.WORKING:
        return this.transition(e.type);

      case this.FINISH:
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

export default class Pool {
  config = {
    maxWorkers: os.cpus().length,
  };

  // {module, command, interval, stats: [{ }]}
  tasks = [];
  // array of Worker
  workers = [];

  constructor(config = {}) {
    const _this = this;

    Object.keys(config).forEach(k => {
      if (_this.config[k]) _this.config[k] = config[k];
    });

    this._initWorkers();
    this._initTasks(config.tasks || {});

    if (process.env.NODE_ENV !== 'test') process.on('beforeExit', this.stop);
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

  _initTasks(tasks) {
    const _this = this;

    for (const t in tasks) {
      if (tasks.hasOwnProperty(t)) {

        const {module, command, interval} = tasks[t];

        this.tasks.push({
          module,
          command,
          stats: [],
          interval: setInterval(() => _this.runTask(module, command), interval),
        });
      }
    }
  }

  runTask(module, command) {
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

  _taskFinished(module, command, duration, error) {
    for (const i in this.tasks) {
      if (this.tasks.hasOwnProperty(i)) {
        const s = this.tasks[i];
        if (s.module === module && s.command === command) {
          if (duration / 1000 > s.interval) logger.info('Task took longer than expected', {module,command, expected: s.interval, actual: Math.round(duration / 1000)});
          s.stats.push({duration, error, timestamp: Date.now()});
          s.stats = s.stats.slice(-10);
          return;
        }
      }
    }
  }

  _getAvailableWorker() {
    const sorted = this.workers.filter(w => w.status === 'waiting').sort((a, b) => a.end < b.end);
    if (!sorted.length) return;
    return sorted[0];
  }

  _stopTasks() {
    this.tasks.forEach(task => {
      try {
        clearInterval(task.interval);
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
