import type {Service, ServiceConfigFunc} from './utils/types'
import request from 'request-promise';
import logger from '../logger/logger';

let service: Record<string, unknown> = {};

const configure: ServiceConfigFunc = (config) => {
    service = config.lookup;
};

function getVehicleByVrm(data: unknown) {
    return send('vehicle/vrm', data);
}

function getVehicleMake() {
    return send('vehicle/make');
}

function getVehicleModel(data: unknown) {
    return send('vehicle/model', data);
}

function getVehicleYear(data: unknown) {
    return send('vehicle/year', data);
}

function getVehicleSpec(data: unknown) {
    return send('vehicle/spec', data);
}

function getAddressesByPostcode(data: unknown) {
    return send('postcode/search', data);
}

function getAddress(data: unknown) {
    return send('postcode/select', data);
}

async function send(path: string, data: unknown = {}) {
    const options = {
        method: 'POST',
        uri: `${service.url}/${path}`,
        body: data,
        json: true,
        headers: {'Authorization': `Bearer ${service.key}`},
    };

    return request(options)
        .then(body => body)
        .catch(e => {
            logger.error('Failed to request Lookup Service', {e});

            return Promise.reject(new Error('Failed to request Lookup Service'));
        });
}

export default {
    configure,
    getVehicleByVrm,
    getVehicleMake,
    getVehicleModel,
    getVehicleYear,
    getVehicleSpec,
    getAddressesByPostcode,
    getAddress,
} as Service;
