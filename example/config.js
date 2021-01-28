import {joi, dotenv, config as common, configSchema} from 'iros-common';

dotenv.config();

// define validation for all the env vars
const envVarsSchema = joi.object({
  NODE_ENV: joi.string().allow(['development', 'production', 'test', 'provision']).default('development'),

  PORT: joi.number().default(4055),

  MONGO_USERNAME: joi.string(),
  MONGO_DB: joi.string().required(),
  MONGO_SERVERS: joi.string().required(),
  MONGO_PASSWORD: joi.string(),
  MONGO_AUTHDB: joi.string(),

  ...configSchema.api,
  ...configSchema.mail,

}).unknown().required();

const {error, value: envVars} = envVarsSchema.validate(process.env);
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
    servers: envVars.MONGO_SERVERS,
    db: envVars.MONGO_DB,
    authdb: envVars.MONGO_AUTHDB,
    password: envVars.MONGO_PASSWORD,
  },
};

export default config;
