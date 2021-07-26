import type {RequestPromiseOptions} from 'request-promise';
import type {RequiredUriUrl} from 'request';
import type {Role} from '../types/role'
import type {Service, ServiceConfigFunc} from './utils/types'
import request from 'request-promise';
import {HttpErrorFactory} from '../errors/http.error';
import _ from 'lodash';
import logger from '../logger/logger';
import Bluebird from 'bluebird';

let service: Record<string, unknown> = {};
let app = '';

export type UserService 
    = Service
    & {
        login: (email: string, password: string) => Bluebird<any>
        canAccess: (jwt: string, role: Role, section?: string) => Bluebird<any>
    }

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
    service = config.user;
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

function do_delete(path: string, data = {}, authorization?: string, override_options?: object) {
    return send({
        ...{
            method: 'DELETE',
            uri: `${service.url}${path}`,
            body: data,
            json: true,
            headers: {authorization},

        },
        ...override_options,
    });
}

function requestPasswordReset(email: string) {
    return post('/auth/password/request-reset', {email});
}

function resetPassword(email: string, token: string, password: string) {
    return post('/auth/password/reset', {
        email,
        token,
        password,
    });
}

function getUsers(jwt: string, company?: string) {
    return get('/user/all', {company}, jwt);
}

function createUser(email: string, jwt: string, company?: string) {
    return post('/user', {
        email,
        company,
    }, jwt);
}

function deleteRole(email: string, role: Role, section: string, jwt: string) {
    const data: Record<string, string> = {
        email,
        app,
        role
    };

    if (section) {
        data.section = section
    }

    return do_delete('/user/role', data, jwt);
}

function deleteUser(email: string, jwt: string) {
    return get('/user', {email}, jwt)
        .then((user: any) => {
            // FIXME: this should be iros-users' responsability
            //
            const roles = user.roles.filter((role: any) => role.app === app);

            return Promise.all(roles.map((role: any) => deleteRole(user.email, role.role, role.section, jwt)))
                .then(result => result[result.length - 1]);
        });
}

function foreDeleteUser(email: string, jwt: string) {
    const data = {
        email,
        app,
    };

    return do_delete('/user', data, jwt);
}

function addRole(email: string, role: string, section: string, jwt: string) {
    const data = {
        email,
        app,
        role,
        section,
    };

    return post('/user/role', data, jwt);
}

export default {
    login,
    canAccess,
    requestPasswordReset,
    resetPassword,
    getUsers,
    createUser,
    addRole,
    deleteRole,
    deleteUser,
    foreDeleteUser,
    configure,
} as UserService;
