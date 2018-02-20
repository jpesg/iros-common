import request from 'request-promise';
import logger from '../logger/logger';

let service = {};

const configure = (config) => {
  service = config.tinyurl;
};

function getLink(response_object) {
  return `${service.url}/${response_object.path}`;
}

function minify(url) {
  const options = {
    method: 'GET',
    uri: `${service.url}/get-tiny-url?return_url=${url}`,
    json: true,
    headers: {
      'Authorization': `Bearer ${service.key}`,
    },
  };

  return request(options)
      .then(body => body)
      .catch(err => {
        logger.error(err);
        return Promise.reject(new Error('Failed to request TinyUrl Service'));
      });
}

export default {getLink, minify, configure};
