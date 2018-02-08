import chai, {expect} from 'chai';
import {describe, beforeEach, afterEach, before, after, it} from 'mocha';
import {configureAuth, authApi} from '../../index';

const config = {
  apiKey: 'TEST-KEY',
};

chai.config.includeStack = true;

describe('## auth/api.middleware.test', () => {
  it('configures with the api strategy and successfully to authenticates', (done) => {

    configureAuth(config);

    const request = {
      headers: {authorization: `Bearer ${config.apiKey}`},
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
      expect(e.message).to.be.equal('Invalid Key')
      done();
    };

    authApi(request, response, next);

  });


});




