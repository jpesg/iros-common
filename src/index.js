//app
import configureApp from './app/express';

//auth
import authApi from './auth/api.middleware';
import authEmailPassword from './auth/email.password.middleware';
import authJWT from './auth/jwt.middleware';
import configureAuth from './auth/passport';

//config
import config, {schema as configSchema} from './config/config';

//errors
import BaseError from './errors/base.error';
import HttpError, {ApiHttpError, UnauthorizedHttpError, BadRequestHttpError, NotFoundHttpError} from './errors/http.error';
import {SkipWorkerError} from './errors/worker.error';

//logger
import logger, {configureLogger} from './logger/logger';

//services
import lookupService from './service/lookup';
import mailService from './service/mail';
import ogiService from './service/ogi';
import textService from './service/text';
import tinyUrlService from './service/tinyurl';
import userService from './service/user';

//workers
import Worker from './worker/pool';

const configureServices = (config) => [
  lookupService,
  mailService,
  ogiService,
  textService,
  tinyUrlService,
  userService,
].forEach(m => m.configure(config));

export {
  //app
  configureApp,

  //auth
  configureAuth,
  authApi,
  authEmailPassword,
  authJWT,

  //config
  config,
  configSchema,

  //errors
  BaseError,
  HttpError,
  ApiHttpError,
  UnauthorizedHttpError,
  BadRequestHttpError,
  NotFoundHttpError,
  SkipWorkerError,

  //logger
  configureLogger,
  logger,

  //todo helpers

  //services
  configureServices,
  lookupService,
  mailService,
  ogiService,
  textService,
  tinyUrlService,
  userService,

  //workers
  Worker,
};