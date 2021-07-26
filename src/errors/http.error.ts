import BaseError from './base.error';
import httpStatus from 'http-status';

export type IHttpError = {
  message: string
  isPublic: boolean
  errors: Record<string, string>
  stack?: string
  status: number
}

export default class HttpError extends BaseError {
  message: string;
  status: number;
  isPublic: boolean;
  errors: Record<string, string>;

  constructor(message: string, isPublic: boolean, errors: Record<string, string>, status: number) {
    super(message);
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.errors = errors;
  }
}

export class ApiHttpError extends HttpError {
  constructor(message: string, isPublic = false, errors = {}, status = httpStatus.INTERNAL_SERVER_ERROR) {
    super(message, isPublic, errors, status);
  }
}

export class NotFoundHttpError extends HttpError {
  constructor(message: string, isPublic = true, errors = {}, status = httpStatus.NOT_FOUND) {
    super(message, isPublic, errors, status);
  }
}

export class UnauthorizedHttpError extends HttpError {
  constructor(message: string, isPublic = true, errors = {}, status = httpStatus.UNAUTHORIZED) {
    super(message, isPublic, errors, status);
  }
}

export class BadRequestHttpError extends HttpError {
  constructor(message: string, isPublic = true, errors = {}, status = httpStatus.BAD_REQUEST) {
    super(message, isPublic, errors, status);
  }
}

export class ValidationHttpError extends HttpError {
  constructor(errors = {}, message = 'Validation Error', isPublic = true, status = httpStatus.BAD_REQUEST) {
    super(message, isPublic, errors, status);
  }
}

export class HttpErrorFactory {
  constructor({message, isPublic, errors, status}: IHttpError) {
    return new HttpError(message, isPublic, errors, status);
  }
}
