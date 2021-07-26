import type {ServiceName} from '../../service/utils/types'
import chai, {expect} from 'chai';
import {describe, it} from 'mocha';
import {configSchema, config} from '../../index';

chai.config.includeStack = true;

describe('## config/config', () => {
    it('configSchema should contain api key', (done) => {
        expect(configSchema.api).not.to.be.undefined;
        expect(configSchema.api?.API_KEY).not.to.be.undefined;
        done();
    });

    it('configSchema should contain user url', (done) => {
        expect(configSchema.user).not.to.be.undefined;
        expect(configSchema.user?.USER_URL).not.to.be.undefined;
        done();
    });

    it('configSchema should contain all the services', (done) => {
        const services = [
            'lookup',
            'mail',
            'ogi',
            'text',
            'tinyUrl'
        ] as ServiceName[];
        services.forEach(k => {
            //Check exists
            expect(configSchema[k]).not.to.be.undefined;
            //Check url
            expect(configSchema[k]?.[`${k.toUpperCase()}_URL`]).not.to.be.undefined;
            //Check key
            expect(configSchema[k]?.[`${k.toUpperCase()}_KEY`]).not.to.be.undefined;
        });
        done();
    });

    it('config should return api key', (done) => {
        const envVars = {API_KEY: 'TEST', };
        const cfg = {api: config('api', envVars), };

        expect(cfg.api.key).to.be.equal(envVars.API_KEY);

        done();
    });

    it('config should return service key and url', (done) => {
        const envVars = {
            MAIL_KEY: 'key',
            MAIL_URL: 'url',
        };
        const cfg = {mail: config('mail', envVars), };

        expect(cfg.mail.key).to.be.equal(envVars.MAIL_KEY);
        expect(cfg.mail.url).to.be.equal(envVars.MAIL_URL);

        done();
    });

    it('config should return service key and url with multiple services configured', (done) => {
        const envVars = {
            MAIL_KEY: 'mail-key',
            MAIL_URL: 'mail-url',

            LOOKUP_URL: 'lookup-url',
            LOOKUP_KEY: 'lookup-key',
        };
        const cfg = {
            mail: config('mail', envVars),
            lookup: config('lookup', envVars),
        };

        expect(cfg.mail.key).to.be.equal(envVars.MAIL_KEY);
        expect(cfg.mail.url).to.be.equal(envVars.MAIL_URL);

        expect(cfg.lookup.key).to.be.equal(envVars.LOOKUP_KEY);
        expect(cfg.lookup.url).to.be.equal(envVars.LOOKUP_URL);

        done();
    });

});
