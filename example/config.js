import Joi from 'joi';
import {config as common, configSchema} from 'iros-common';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().allow(['development', 'production', 'test', 'provision']).default('development'),

  PORT: Joi.number().default(4055),

  MONGO_USERNAME: Joi.string(),
  MONGO_DB: Joi.string().required(),
  MONGO_SERVERS: Joi.string().required(),

  ...configSchema.api,
  ...configSchema.mail,

}).unknown().required();

const {error, value: envVars} = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,

  //todo generate automatically
  api: common('api', envVars),

  service: {
    mail: common('mail', envVars),
  },

  mongo: {
    username: envVars.MONGO_USERNAME,
    server: envVars.MONGO_SERVERS,
    db: envVars.MONGO_DB,
  },
};

export default config;
