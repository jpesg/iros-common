import BaseError from './base.error';
import httpStatus from 'http-status';

export default class WorkerError extends BaseError {
  constructor(message, isFailure) {
    super(message);
    this.message = message;
    this.isFailure = isFailure;
  }
}

export class SkipWorkerError extends WorkerError {
  constructor(message) {
    super(message, false);
  }
}