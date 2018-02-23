import {SkipWorkerError} from '../../index';

const success = () => Promise.resolve();

const skip = () => Promise.reject(new SkipWorkerError('Skipped'));

const fail = () => Promise.reject(new Error('Failed'));

const delayedSuccess = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, 1000);
});

const delayedSkip = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new SkipWorkerError('Skipped'));
  }, 1000);
});

const delayedFail = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('Failed'));
  }, 1000);
});

export default {success, delayedSuccess, fail, delayedFail, skip, delayedSkip};