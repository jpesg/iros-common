//app
import configureApp from './app/express';

//auth
import authApi from './auth/api.middleware';
import authEmailPassword from './auth/email.password.middleware';
import authJWT from './auth/jwt.middleware';
import authUserRole from './auth/user.middleware';
import configureAuth from './auth/passport';

//config
import config, {schema as configSchema} from './config/config';

//errors
import BaseError from './errors/base.error';
import HttpError, {ApiHttpError, UnauthorizedHttpError, BadRequestHttpError, NotFoundHttpError, HttpErrorFactory} from './errors/http.error';
import {SkipWorkerError} from './errors/worker.error';

//logger
import logger, {configureLogger} from './logger/logger';

//helpers
import numberHelper from './helpers/number';

//services
import dialerService from './service/dialer';
import lookupService from './service/lookup';
import mailService from './service/mail';
import ogiService from './service/ogi';
import textService from './service/text';
import tinyUrlService from './service/tinyurl';
import userService from './service/user';

//db
import configureMongoose, {connect as connectMongoose, disconnect as disconnectMongoose} from './app/mongoose';

//workers
import Worker from './worker/pool';

//workflow
import Workflow from './workflow/workflow';
import WorkflowStep from './workflow/workflow.step';
import PersistentWorkflowStep from './workflow/workflow.step.persistent';

//validation
import validate from './validation/joi.validation';

// libs
import lodash from 'lodash';
import moment from 'moment';
import mongoose from 'mongoose';
import request from 'request-promise';
import express from 'express';
import dotenv from 'dotenv';
import joi from 'joi';

const configureServices = (config, app) => [
  dialerService,
  lookupService,
  mailService,
  ogiService,
  textService,
  tinyUrlService,
  userService,
].forEach(m => m.configure(config, app));

export {
  //app
  configureApp,

  //db
  configureMongoose,
  connectMongoose,
  disconnectMongoose,

  //auth
  configureAuth,
  authApi,
  authEmailPassword,
  authJWT,
  authUserRole,

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
  HttpErrorFactory,
  SkipWorkerError,

  //logger
  configureLogger,
  logger,

  //helpers
  numberHelper,

  //services
  configureServices,
  dialerService,
  lookupService,
  mailService,
  ogiService,
  textService,
  tinyUrlService,
  userService,

  //workers
  Worker,

  //workflow
  Workflow,
  WorkflowStep,
  PersistentWorkflowStep,

  //validations
  validate,

  // libs
  lodash, moment, mongoose, request, express, dotenv, joi,
};