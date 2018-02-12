// todo on exit , kill all children

// todo start with children

import logger from '../logger/logger';
import child_process from 'child_process';
import os from 'os';
import {v4 as uuid} from 'uuid';

class Pool {
  config = {
    maxWorkers: os.cpus().length,
    tasks: {},
  };

  workers = {};

  constructor(config = {}) {
    const _this = this;

    //configure
    Object.keys(config).forEach(k => {
      if (_this.config[k]) _this.config[k] = config[k];
    });

    this.initWorkers();
    this.initTasks();
  }

  stats() {
    //todo provide better stats
    const stats = {}, {workers} = this;
    Object.keys(workers).forEach(k => {
      const {last, status} = workers[k];
      stats[k] = {last, status};
    });
    return stats;
  }

  initWorkers() {
    const _this = this, {config: {maxWorkers}, workers} = _this;

    for (let i = 0; i < maxWorkers; i++) {
      const worker = {
        status: 'waiting',
        last: 0,
        process: child_process.fork(`${__dirname}/worker`),
      };

      worker.process.on('message', (msg) => _this.onMessage(msg));

      const w = uuid();
      workers[w] = worker;
      _this.sendToWorker(w, 'init', {uuid: w});
    }
  }

  initTasks() {
    const _this = this,
        {tasks} = _this.config;

    for (const t in tasks) {
      if (tasks.hasOwnProperty(t)) {

        const task = tasks[t];
        setInterval(() => _this.runTask(task.module, task.command), task.interval);
      }
    }
  }

  getAvailableWorker() {
    const {workers} = this;
    const sorted = Object.keys(workers).filter(key => workers[key].status === 'waiting').sort((a, b) => a.last < b.last);
    if (!sorted.length) return;
    return sorted[0];
  }

  runTask(module, command, args = []) {
    const worker = this.getAvailableWorker();
    if (!worker) {
      logger.error('failed to get worker');
      return;
    }
    this.sendToWorker(worker, 'run', {module, command, ...args});
  }

  sendToWorker(uuid, type, message) {
    try {
      this.workers[uuid].process.send({type, message});
    } catch (e) {
      console.error(e);
    }
  };

  onMessage(e) {
    if (!e.uuid) return logger.error(`Received invalid message ${JSON.stringify(e)}`);

    const {workers} = this;
    if (!workers[e.uuid]) return logger.error(`Received message from non-existing worker ${e.uuid}`);

    const worker = workers[e.uuid];

    switch (e.type) {
      case 'run':
        switch (e.message.status) {
          case 'started':
            worker.status = 'working';
            break;
          case 'finished':
            worker.status = 'waiting';
            worker.last = new Date().getTime();
            break;
          case 'failed':
            worker.status = 'waiting';
            worker.last = new Date().getTime();
            logger.error(`worker failure ${e.message.error}`);
            break;
        }
        break;
    }
  }
}

export default Pool;
