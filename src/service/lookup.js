import request from 'request-promise';
import logger from '../logger/logger';

let service = {};

const configure = (config) => {
  service = config.lookup;
};

function getVehicleByVrm(data) {
  return send('vehicle/vrm', data);
}

function getVehicleMake() {
  return send('vehicle/make');
}

function getVehicleModel(data) {
  return send('vehicle/model', data);
}

function getVehicleYear(data) {
  return send('vehicle/year', data);
}

function getVehicleSpec(data) {
  return send('vehicle/spec', data);
}

function getAddressesByPostcode(data) {
  return send('postcode/search', data);
}

function getAddress(data) {
  return send('postcode/select', data);
}

function send(path, data = {}) {
  const options = {
    method: 'POST',
    uri: `${service.url}/${path}`,
    body: data,
    json: true,
    headers: {
      'Authorization': `Bearer ${service.key}`,
    },
  };

  return request(options)
      .then(body => body)
      .catch(err => {
        logger.error(err);
        return Promise.reject(new Error('Failed to request Lookup Service'));
      });
}

export default {configure, getVehicleByVrm, getVehicleMake, getVehicleModel, getVehicleYear, getVehicleSpec, getAddressesByPostcode, getAddress,};
