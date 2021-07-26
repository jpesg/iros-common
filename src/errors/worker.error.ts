import BaseError from './base.error';

export default class WorkerError extends BaseError {
  isFailure: boolean;

  constructor(message: string, isFailure: boolean) {
    super(message);
    this.message = message;
    this.isFailure = isFailure;
  }
}

export class SkipWorkerError extends WorkerError {
  constructor(message: string) {
    super(message, false);
  }
}
