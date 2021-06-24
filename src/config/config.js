import Joi from 'joi';

const getServiceUrl = (service) => `${service.toUpperCase()}_URL`,
    getServiceKey = (service) => `${service.toUpperCase()}_KEY`;

const schema = {
    api: {API_KEY: Joi.string().required()},
    user: {USER_SECTIONS: Joi.string().required()},
};

const services = [
    'user',
    'dialer',
    'lookup',
    'mail',
    'ogi',
    'text',
    'tinyUrl',
];
for (const s in services) {
    if (services.hasOwnProperty(s)) {
        const service = services[s];
        // Add to schema
        schema[service] = {...(schema[service] || {})};
        schema[service][getServiceUrl(service)] = Joi.string().required();
        schema[service][getServiceKey(service)] = Joi.string().required();
    }
}
export {schema};

const config = (service, envVars = {}) => {
    const out = {};

    if (schema[service] && schema[service][getServiceUrl(service)]) {
        out.url = envVars[getServiceUrl(service)];
    }

    if (schema[service] && schema[service][getServiceKey(service)]) {
        out.key = envVars[getServiceKey(service)];
    }

    if (service === 'user' && schema[service] && schema[service].USER_SECTIONS) {
        out.sections = envVars.USER_SECTIONS.split(',');
        out.SECTIONS = envVars.USER_SECTIONS.split(',').reduce((obj, section) => ({
            ...obj,
            [section.toUpperCase()]: section
        }), {});
        out.ROLES = {
            ADMIN: 'admin',
            USER: 'user',
        };
    }

    return out;
};

export default config;
