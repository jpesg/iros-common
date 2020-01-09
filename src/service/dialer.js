import request from 'request-promise';
import logger from '../logger/logger';

let service = {};

const configure = (config) => {
  service = config.dialer;
};

function scheduleCall({first_name, surname, mobile, email, type, data = {}, delay = 0}) {
  return send('lead/add', {first_name, surname, mobile, email, type, data: JSON.stringify(data), delay});
}

function cancelCall({mobile, type}) {
  return send('lead/cancel', {mobile, type});
}

function send(path, data = {}) {
  const options = {
    method: 'POST',
    uri: `${service.url}/${path}?key=${service.key}`,
    body: data,
    json: true,
  };

  return request(options)
      .then(body => body)
      .catch(err => {
        logger.error(err);
        return Promise.reject(new Error('Failed to request Dialer Service'));
      });
}

export default {configure, cancelCall, scheduleCall};
