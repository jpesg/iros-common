import type {ServiceConfigFunc, Service} from './utils/types'
import request from 'request-promise';
import logger from '../logger/logger';

let service: Record<string, unknown> = {};

const configure: ServiceConfigFunc = (config) => {
    service = config.text;
};

function send(from: string, to: string, content: string, processAt: string) {
    return req('text', 'POST', {
        from,
        to,
        content,
        processAt
    });
}

function get(id: string) {
    return req(`text?id=${id}`);
}

function req(path: string, method = 'GET', data: unknown = {}) {
    const options = {
        method,
        headers: {'Authorization': `Bearer ${service.key}`},
        uri: `${service.url}/${path}`,
        json: true,
        body: data,
    };

    return request(options)
        .then(body => body)
        .catch(e => {
            logger.error('Failed to request Text Service', {e});

            return Promise.reject(new Error('Failed to request Text Service'));
        });
}

export default {
    send,
    get,
    configure
} as Service;
