import Joi from 'joi';
import type {ServiceName} from '../service/utils/types'

const appendUrl = (s: string): string => `${s.toUpperCase()}_URL`
const appendKey = (s: string): string => `${s.toUpperCase()}_KEY`

type Schema = Record<ServiceName | 'api', Record<string, Joi.StringSchema>>

const schema: Partial<Schema> = {
    api: {API_KEY: Joi.string().required()},
    user: {USER_SECTIONS: Joi.string().required()},
};

const services: ServiceName[] = [
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
        schema[service]![appendUrl(service)] = Joi.string().required();
        schema[service]![appendKey(service)] = Joi.string().required();
    }
}

export {schema};

type Config = {
    url: string
    key: string
    [key: string]: unknown
}

const config = (service: ServiceName | 'api', envVars: Record<string, string> = {}): Config => {
    const out: Partial<Config> = {};

    if (schema[service] && schema[service]![appendUrl(service)]) {
        out.url = envVars[appendUrl(service)];
    }

    if (schema[service] && schema[service]![appendKey(service)]) {
        out.key = envVars[appendKey(service)];
    }

    if (service === 'user' && schema[service] && schema[service]?.USER_SECTIONS !== undefined) {
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

    return out as Config;
};

export default config;
