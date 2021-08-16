import type {RequestPromiseOptions} from 'request-promise';
import type {RequiredUriUrl} from 'request';
import type {Role} from '../types/role'
import type {Service, ServiceConfigFunc} from './utils/types'
import request from 'request-promise';
import {HttpErrorFactory} from '../errors/http.error';
import _ from 'lodash';
import logger from '../logger/logger';

let service: Record<string, unknown> = {};
let app = '';

function send(options: Partial<RequestPromiseOptions> & RequiredUriUrl) {
    // Prepend JWT if we receive plain auth token
    if (
      options.headers !== undefined &&
      options.headers.authorization &&
      !options.headers.authorization.match(/^bearer /i) &&
      !options.headers.authorization.match(/^jwt /i)
    ) {
        options.headers.authorization = `JWT ${options.headers.authorization}`;
    }

    return request(options)
        .then(body => body)
        .catch(r => {
            const message: string = _.get(r, 'error.message', 'Failed to request User Service'),
                errors: Record<string, string> = _.get(r, 'error.errors', {}),
                isPublic = r.statusCode !== 500,
                status: number = r.statusCode || 500;

            
            return Promise.reject(new HttpErrorFactory({
                message,
                isPublic,
                errors,
                status,
            }));
        });
}

function post(path: string, data: unknown, authorization?: string, override_options?: object) {
    return send({
        ...{
            method: 'POST',
            uri: `${service.url}${path}`,
            body: data,
            json: true,
            headers: {authorization},
        },
        ...override_options,
    });
}

function get(path: string, data: Record<string, unknown> = {}, authorization?: string, override_options?: object) {
    return send({
        ...{
            method: 'GET',
            uri: `${service.url}${path}?${Object.keys(data).map((key) => `${key}=${data[key]}`)
                .join('&')}`,
            json: true,
            headers: {authorization},
        },
        ...override_options,
    });
}

const configure: ServiceConfigFunc = (config, app_name) => {
    service = config;
    app = app_name;

    post('/app/settings', {
        app,
        sections: service.sections
    }, `bearer ${service.key}`).catch(e => {
        logger.error('failed to setup app and sections on user service', {e});
    });
};

function login(email: string, password: string) {
    return post('/auth/password', {
        email,
        password,
    });
}

function canAccess(jwt: string, role: Role = 'user', section?: string) {
    return get('/user/can-access', {
        app,
        section,
        role,
    }, jwt);
}

function getUsers(jwt: string, company?: string) {
    return get('/user/all', {company}, jwt);
}

export type UserService 
    = {
        login: typeof login
        canAccess: typeof canAccess
        getUsers: typeof getUsers
    }
    & Service

export default {
    login,
    canAccess,
    getUsers,
    configure,
} as UserService;
