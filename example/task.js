import {configureLogger, logger} from 'iros-common';

configureLogger();

const run = () => new Promise((resolve, reject) => {
  try {
    setTimeout(() => {
      logger.info('worker resolving...');
      resolve();
    }, 500);
  } catch (e) {
    reject(e);
  }
});

export default {run};