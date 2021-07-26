import type {Service, ServiceConfigFunc} from './utils/types'
import request from 'request-promise';
import logger from '../logger/logger';

let service: Record<string, unknown> = {};

const configure: ServiceConfigFunc = (config) => {
    service = config;
};

async function send(query: string, params: Record<string, string>) {
    const options = {
        method: 'POST',
        uri: `${service.url}/query`,
        body: {
            query: query.replace(/\r?\n|\r/g, ' '),
            params
        },
        json: true,
        headers: {'Authorization': `Bearer ${service.key}`, },
    };

    return request(options)
        .then(body => body)
        .catch(e => {
            logger.error('Failed to request OGI Service', {e});

            return Promise.reject(new Error('Failed to request OGI Service'));
        });
}

export default {
    send,
    configure
} as Service;
