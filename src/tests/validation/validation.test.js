import chai, {expect} from 'chai';
import {describe, beforeEach, afterEach, before, after, it} from 'mocha';
import validate from '../../validation/joi.validation';
import Joi from 'joi';

chai.config.includeStack = true;

describe('## Validation Middleware', () => {
  it('should return error', (done) => {

    const request = {
      body: {
        subject: '',
      },
    };

    const schema = {
      body: {
        subject: Joi.string().required(),
      },
    };

    const response = {};

    const next = (e) => {
      expect(e).is.not.null;
      done();
    };

    validate(schema)(request, response, next);
  });

  it('should return custom error defined in schema', (done) => {

    const custom_error = 'Subject in body is required';

    const request = {
      body: {
        // subject: '',
      },
    };

    const schema = {
      body: {
        subject: Joi.string().required().messages({'any.required': custom_error}),
      },
    };

    const next = (e) => {
      expect(e).is.not.null;
      expect(e.errors.subject).to.be.equal(custom_error);
      done();
    };

    validate(schema)(request, {}, next);
  });

  it('should return custom error defined in default options', (done) => {

    const request = {body: {}};

    const schema = {
      body: {
        subject: Joi.string().required(),
      },
    };

    const next = (e) => {
      expect(e).is.not.null;
      expect(e.errors.subject).to.be.equal('Required');
      done();
    };

    validate(schema)(request, {}, next);
  });
});



