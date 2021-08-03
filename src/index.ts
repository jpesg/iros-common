//App
import configureApp from './app/express';

//Auth
import authApi from './auth/api.middleware';
import authEmailPassword from './auth/email.password.middleware';
import authJWT from './auth/jwt.middleware';
import authUserRole from './auth/user.middleware';
import configureAuth from './auth/passport';

//Config
import config, {schema as configSchema} from './config/config';

//Errors
import BaseError from './errors/base.error';
import HttpError, {ApiHttpError, UnauthorizedHttpError, BadRequestHttpError, NotFoundHttpError, HttpErrorFactory} from './errors/http.error';
import {SkipWorkerError} from './errors/worker.error';

//Logger
import logger, {configureLogger} from './logger/logger';

//Helpers
import numberHelper from './helpers/number';

//Services
import dialerService from './service/dialer';
import lookupService from './service/lookup';
import mailService from './service/mail';
import ogiService from './service/ogi';
import textService from './service/text';
import tinyUrlService from './service/tinyurl';
import userService from './service/user';

//Db
import configureMongoose, {connect as connectMongoose, disconnect as disconnectMongoose} from './app/mongoose';

//Workers
import Worker from './worker/pool';

//Workflow
import Workflow from './workflow/workflow';
import WorkflowStep from './workflow/workflow.step';

//Validation
import validate, {Joi as joi} from './validation/joi.validation';

// Libs
import lodash from 'lodash';
import moment from 'moment';
import mongoose from 'mongoose';
import request from 'request-promise';
import express from 'express';
import dotenv from 'dotenv';

// Types
import type {Service, ServiceName} from './service/utils/types'

const serviceMap: Record<ServiceName, Service> = {
    'dialer': dialerService,
    'lookup': lookupService,
    'mail': mailService,
    'ogi': ogiService,
    'text': textService,
    'tinyUrl': tinyUrlService,
    'user': userService
};

type RecordOfUnknowns = Record<string, unknown>

const configureServices = (
    services: Partial<Record<ServiceName, Record<string, unknown>>>,
    app: string
) => Object.keys(services).forEach((name) => {
    if (!serviceMap.hasOwnProperty(name)) return;
    return serviceMap[name as ServiceName].configure(services[name as ServiceName] as RecordOfUnknowns, app)
});

export {
    //App
    configureApp,

    //Db
    configureMongoose,
    connectMongoose,
    disconnectMongoose,

    //Auth
    configureAuth,
    authApi,
    authEmailPassword,
    authJWT,
    authUserRole,

    //Config
    config,
    configSchema,

    //Errors
    BaseError,
    HttpError,
    ApiHttpError,
    UnauthorizedHttpError,
    BadRequestHttpError,
    NotFoundHttpError,
    HttpErrorFactory,
    SkipWorkerError,

    //Logger
    configureLogger,
    logger,

    //Helpers
    numberHelper,

    //Services
    configureServices,
    dialerService,
    lookupService,
    mailService,
    ogiService,
    textService,
    tinyUrlService,
    userService,

    //Workers
    Worker,

    //Workflow
    Workflow,
    WorkflowStep,

    //Validations
    validate,

    // Libs
    lodash, moment, mongoose, request, express, dotenv, joi,
};
