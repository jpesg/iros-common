import chai, {expect} from 'chai';
import {describe, beforeEach, afterEach, before, after, it} from 'mocha';
import {configureAuth} from '../../index';

chai.config.includeStack = true;

describe('## auth/passport', () => {
  it('configures passport without any strategies', (done) => {

    configureAuth({}, []);

    // todo check we can't use any strategy

    done();
  });

});


