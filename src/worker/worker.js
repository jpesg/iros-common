import logger from '../logger/logger';

let worker;

process.on('message', (e) => {
  switch (e.type) {
    case 'init':
      worker = new Worker(e.message.uuid);
      break;
    case 'run':
      const {module, command} = e.message;
      worker.run(module, command);
      break;
    default:
      logger.errro(`Received invalid message ${JSON.stringify(e)}`);
      break;
  }
});

class Worker {
  uuid;

  sendToPool(type, message) {
    process.send({uuid: this.uuid, type, message});
  }

  constructor(uuid) {
    this.uuid = uuid;
  }

  runStarted() {
    this.sendToPool('run', {status: 'started'});
  }

  runFinished() {
    this.sendToPool('run', {status: 'finished'});
  }

  runFailed(error) {
    this.sendToPool('run', {status: 'failed', error});
  }

  run(module, command) {
    const _this = this;

    _this.runStarted();

    //require module
    const mod = require(module);
    if (!mod) return _this.runFailed(`Module ${module} not found!`);

    //check fn is promise
    const fn = mod[command];

    //todo check return from fn is a Promise

    return fn()
        .then(() => _this.runFinished())
        .catch(e => this.runFailed(e));

  }
}

