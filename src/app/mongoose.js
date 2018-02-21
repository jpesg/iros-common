import mongoose from 'mongoose';
import fs from 'fs';

const configure = (config) => {
  // make bluebird default Promise
  Promise = require('bluebird');

  // plugin bluebird promise in mongoose
  mongoose.Promise = Promise;

  // connect to mongo db
  let mongoOptions = {authSource: config.mongo.db};
  if (config.mongo.server.indexOf(',') >= 0) mongoOptions.replicaSet = config.mongo.rs;
  if (config.mongo.cert) {
    mongoOptions = {
      ...mongoOptions,
      ssl: true,
      sslCert: fs.readFileSync(config.mongo.cert),
      sslKey: fs.readFileSync(config.mongo.key),
    };
  }
  let credentials = '';
  if (config.mongo.username) credentials += config.mongo.username;
  if (config.mongo.password) credentials += `:${config.mongo.password}`;
  if (credentials.length) credentials += '@';

  const mongoUri = `mongodb://${credentials}${config.mongo.server}/${config.mongo.db}`;
  mongoose.connect(mongoUri, mongoOptions);
  mongoose.connection.on('error', (e) => {
    throw new Error(`unable to connect to database: ${mongoUri} ${e}`);
  });
};

export default configure;