import type {Service, ServiceConfigFunc} from './utils/types'
import request from 'request-promise';
import logger from '../logger/logger';

let service: Record<string, unknown> = {};

const configure: ServiceConfigFunc = (config) => {
    service = config
};

type CallType = {
    mobile: string
    type: string
}

type CallDetails 
    = {
        first_name: string
        surname: string
        email: string
    }
    & CallType

function scheduleCall({first_name, surname, mobile, email, type, data = {}, delays = 0}: CallDetails & { data: unknown, delays: number }) {
    return send('lead/add', {
        first_name,
        surname,
        mobile,
        email,
        type,
        data: JSON.stringify(data),
        delays
    });
}

function cancelCall({mobile, type}: CallType) {
    return send('lead/cancel', {
        mobile,
        type
    });
}

function send(path: string, data = {}) {
    const options = {
        method: 'POST',
        uri: `${service.url}/${path}?key=${service.key}`,
        body: data,
        json: true,
    };

    return request(options)
        .then(body => body)
        .catch(e => {
            logger.error('Failed to request dialler service', {e});

            return Promise.reject(new Error('Failed to request Dialer Service'));
        });
}

export default {
    configure,
    cancelCall,
    scheduleCall
} as Service;
