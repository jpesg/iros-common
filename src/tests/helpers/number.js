import chai, {expect} from 'chai';
import {describe, beforeEach, afterEach, before, after, it} from 'mocha';
import {numberHelper} from '../../index';

chai.config.includeStack = true;

describe('## helpers/number', () => {
  it('should validate  and format various numbers', (done) => {

    // cross country is invalid
    expect(numberHelper.isValid('+4403308081500', 'GB')).to.be.equal(true);
    expect(numberHelper.isValid('+4403308081500', 'US')).to.be.equal(false);

    const valid_formats = ['+4403308081500', '(+440)3308081500', '0330 808 1500', '0044(0)330 808 1500', '00443308081500'];

    // various formats are valid
    valid_formats.forEach(f => {
      expect(numberHelper.isValid(f)).to.be.equal(true);
    });

    // local numbers
    valid_formats.forEach(f => {
      expect(numberHelper.getLocal(f)).to.be.equal('0330 808 1500');
    });

    // international numbers
    valid_formats.forEach(f => {
      expect(numberHelper.getInternational(f)).to.be.equal('+443308081500');
    });

    done();
  });
});




