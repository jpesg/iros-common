import request from 'request-promise';
import logger from '../logger/logger';

let service = {};

const configure = (config) => {
    service = config.text;
};

function send(from, to, content, processAt) {
    return req('text', 'POST', {
        from,
        to,
        content,
        processAt
    });
}

function get(id) {
    return req(`text?id=${id}`);
}

function req(path, method = 'GET', data = {}) {
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
};
