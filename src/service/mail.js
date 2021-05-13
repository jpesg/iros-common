import request from 'request-promise';
import logger from '../logger/logger';

let service = {};

const configure = (config) => {
    service = config.mail;
};

function send({sender, from, to, subject, html, text, bcc, attachment}) {
    return post('mail', {
        sender,
        from,
        to,
        subject,
        html,
        text,
        bcc,
        attachment
    });
}

function sendError(message, level = 'error', info = '') {
    return post('error', {
        message,
        level,
        info
    });
}

function post(path, data) {
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
};
