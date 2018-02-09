import chai, {expect} from 'chai';
import {describe, beforeEach, afterEach, before, after, it} from 'mocha';
import {configureAuth, authApi, configureApp} from '../../index';
import express from 'express';
import request from 'supertest';
import httpStatus from 'http-status';

const config = {
  api: {key: 'TEST-KEY'},
};

const router = express.Router();
router.get('/auth-only', authApi, (req, res) => res.json({}));

chai.config.includeStack = true;

describe('## auth/api.middleware.test', () => {

  it('configures with the api strategy and successfully to authenticates', (done) => {

    configureAuth(config);

    const request = {
      headers: {authorization: `Bearer ${config.api.key}`},
    };

    const response = {};

    const next = (e) => {
      done(e);
    };

    authApi(request, response, next);

  });

  it('configures with the api strategy and fails to authenticate with wrong api key', (done) => {

    configureAuth(config);

    const request = {
      headers: {authorization: `Bearer INVALID KEY`},
    };

    const response = {};

    const next = (e) => {
      expect(e).is.not.null;
      expect(e.message).to.be.equal('Invalid Key');
      done();
    };

    authApi(request, response, next);

  });

  it('configures with the api strategy and fails to authenticate with wrong api key with express', (done) => {

    configureAuth(config);
    const app = configureApp(router);

    request(app)
        .get('/auth-only')
        .set('Authorization', `Bearer INVALID-${config.api.key}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => done())
        .catch(e => done(e));
  });

  it('configures with the api strategy and successfully authenticates with express', (done) => {

    configureApp(config);
    const app = configureApp(router);

    request(app)
        .get('/auth-only')
        .set('Authorization', `Bearer ${config.api.key}`)
        .send()
        .expect(httpStatus.OK)
        .then(() => done())
        .catch(e => done(e));
  });

});

