import type {ServiceConfigFunc, Service} from './utils/types'
import request from 'request-promise';
import logger from '../logger/logger';

let service: Record<string, unknown> = {};

const configure: ServiceConfigFunc = (config) => {
    service = config;
};

function getLink(response_object: { path: string }) {
    return `${service.url}/${response_object.path}`;
}

function minify(url: string) {
    const options = {
        method: 'GET',
        uri: `${service.url}/get-tiny-url?return_url=${Buffer.from(url).toString('base64')}&is_base_64=true`,
        json: true,
        headers: {'Authorization': `Bearer ${service.key}`},
    };

    return request(options)
        .then(body => body)
        .catch(e => {
            logger.error('Failed to request TinyUrl Service', {e});

            return Promise.reject(new Error('Failed to request TinyUrl Service'));
        });
}

export type TinyUrlService
    = {
        getLink: typeof getLink
        minify: typeof minify
    }
    & Service

export default {
    getLink,
    minify,
    configure
} as TinyUrlService;
