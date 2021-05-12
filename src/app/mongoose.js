import fs from 'fs';
import logger from '../logger/logger';

let mongoUri,
    mongoOptions = {};

const notConfigured = () => new Error('Not Configured');
let connect = notConfigured,
    disconnect = notConfigured;

const configure = (config, mongoose = null, connect_automatically = true) => {
    mongoose = mongoose || require('mongoose');

    connect = () => mongoose.connect(mongoUri, mongoOptions, error => {
        if (error) {
            logger.error('failed to connect to mongodb', {
                mongoUri,
                mongoOptions
            });
        }
    });

    disconnect = () => mongoose.disconnect();

    // Make bluebird default Promise
    Promise = require('bluebird');

    // Plugin bluebird promise in mongoose
    mongoose.Promise = Promise;

    // Define options
    mongoOptions.useUnifiedTopology = true;
    mongoOptions.useNewUrlParser = true;
    mongoOptions.authSource = config.mongo.authdb && config.mongo.authdb.length ? config.mongo.authdb : config.mongo.db;

    // Connect to mongo db
    if (config.mongo.servers.indexOf(',') >= 0) {
        mongoOptions.replicaSet = config.mongo.rs;
    }
    if (config.mongo.ssl) {
        mongoOptions.ssl = true;
    }
    if (config.mongo.cert) {
        mongoOptions = {
            ...mongoOptions,
            ssl: true,
            sslCert: fs.readFileSync(config.mongo.cert),
            sslKey: fs.readFileSync(config.mongo.key),
        };
    }
    let credentials = '';
    if (config.mongo.username) {
        credentials += config.mongo.username;
    }
    if (config.mongo.password) {
        credentials += `:${config.mongo.password}`;
    }
    if (credentials.length) {
        credentials += '@';
    }

    mongoUri = `mongodb://${credentials}${config.mongo.servers}/${config.mongo.db}`;

    if (connect_automatically) {
        mongoose.connection.on('error', error => logger.error('unable to connect to database', {
            mongoUri,
            mongoOptions,
            error
        }));
        connect();
    }
};

export default configure;
export {connect, disconnect};
