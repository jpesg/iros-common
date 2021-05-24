import request from 'request-promise';
import logger from '../logger/logger';

let service = {};

const configure = (config) => {
    service = config.tinyUrl;
};

function getLink(response_object) {
    return `${service.url}/${response_object.path}`;
}

function minify(url) {
    const options = {
        method: 'GET',
        uri: `${service.url}/get-tiny-url?return_url=${new Buffer(url).toString('base64')}&is_base_64=true`,
        json: true,
        headers: {'Authorization': `Bearer ${service.key}`, },
    };

    return request(options)
        .then(body => body)
        .catch(e => {
            logger.error('Failed to request TinyUrl Service', {e});

            return Promise.reject(new Error('Failed to request TinyUrl Service'));
        });
}

export default {
    getLink,
    minify,
    configure
};
