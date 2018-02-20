import Joi from 'joi';

const getServiceUrl = (service) => `${service.toUpperCase()}_URL`,
    getServiceKey = (service) => `${service.toUpperCase()}_KEY`;

const schema = {
  api: {
    API_KEY: Joi.string().required(),
  },
  user: {
    USER_URL: Joi.string().required(),
  },
};

const services = ['lookup', 'mail', 'ogi', 'text', 'tinyurl'];
for (const s in services) {
  if (services.hasOwnProperty(s)) {
    const service = services[s];
    // add to schema
    schema[service] = {};
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

  return out;
};

export default config;
