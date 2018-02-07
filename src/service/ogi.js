import request from 'request-promise';
import logger from '../logger/logger';

let service = {};

const configure = (config) => {
  service = config.ogi;
};

function send(query, params) {
  const options = {
    method: 'POST',
    uri: `${service.url}/query`,
    body: {query: query.replace(/\r?\n|\r/g, ' '), params},
    json: true,
    headers: {
      'Authorization': `Bearer ${service.key}`,
    },
  };

  return request(options)
      .then(body => body)
      .catch(err => {
        logger.error(err);
        return Promise.reject(new Error('Failed to request OGI Service'));
      });
}

export default {send, configure};
