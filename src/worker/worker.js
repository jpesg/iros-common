import {SkipWorkerError} from '../errors/worker.error';
import logger from '../logger/logger';

process.on('message', (e) => {
  switch (e.type) {
    case 'exec':
      return exec(e.module, e.command);

  }
});

const send = (type, error) => process.send({type, error});

const waiting = () => send('waiting');
const failed = (e) => send('finish', e.message || 'Unknown error');
const finished = () => send('finish');

const exec = (module, command) => {
  //send working
  send('working');

  //require module
  const mod = require(module);
  if (!mod) return failed(new Error(`Module ${module} not found!`));

  //check fn is function
  const fn = mod[command];
  if (typeof fn !== 'function') return failed(new Error(`Command ${command} not found!`));

  //exec
  try {
    return fn()
        .then(() => finished())
        .catch(e => {
          if (e instanceof SkipWorkerError) return finished();

          failed(e);
        });
  } catch (e) {
    failed(e);
  }
};

waiting();