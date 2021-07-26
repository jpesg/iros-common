import type {Service, ServiceConfigFunc} from './utils/types'
import request from 'request-promise';
import logger from '../logger/logger';

let service: Record<string, unknown> = {};

const configure: ServiceConfigFunc = (config) => {
    service = config;
};

type MandatorySendProps = {
    sender: string,
    from: string,
    to: string,
    text: string,
    subject: string,
    html: string
}

type ExtraSendProps = {
    bcc: string
    attachment: string
}

type SendProps = MandatorySendProps & Partial<ExtraSendProps>

function send(props: SendProps) {
    return post('mail', props);
}

function sendError(message: string, level = 'error', info = '') {
    return post('error', {
        message,
        level,
        info
    });
}

function post(path: string, data: unknown) {
    const options = {
        method: 'POST',
        uri: `${service.url}/${path}`,
        body: data,
        json: true,
        headers: {'Authorization': `Bearer ${service.key}`, },
    };

    return request(options)
        .then(body => body)
        .catch(e => {
            logger.error('Failed to request Mail Service', {e});

            return Promise.reject(new Error('Failed to request Mail Service'));
        });

}

export default {
    send,
    sendError,
    configure
} as Service;
