//app
import configureApp from './app/express';

//auth
import authApi from './auth/api.middleware';
import authEmailPassword from './auth/email.password.middleware';
import authJWT from './auth/jwt.middleware';
import configureAuth from './auth/passport';

//errors
import BaseError from './errors/base.error';
import HttpError, {ApiHttpError, UnauthorizedHttpError, BadRequestHttpError, NotFoundHttpError} from './errors/http.error';

//logger
import logger, {configureLogger} from './logger/logger';

//services
import lookupService from './service/lookup';
import mailService from './service/mail';
import ogiService from './service/ogi';
import textService from './service/text';
import tinyUrlService from './service/tinyurl';
import userService from './service/user';

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

  //errors
  BaseError,
  HttpError,
  ApiHttpError,
  UnauthorizedHttpError,
  BadRequestHttpError,
  NotFoundHttpError,

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
};