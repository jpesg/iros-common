import type { Strategy } from 'passport';
import passport from 'passport';
import local from 'passport-local';
import bearer from 'passport-http-bearer';
import userService from '../service/user';

type Config = {
  api: {
    key: string
  }
}

type PassportStrategy = {
  name: string
  fn: (config: Config) => Strategy
}


const strategies: PassportStrategy[] = [
  {
    name: 'api',
    fn: (config) => new bearer.Strategy((key, callback) => {
      if (!key || !key.length) return callback('Empty Access Key');
      if (key !== config.api.key) return callback('Invalid Access Key');

      return callback(null, true);
    }),
  },
  {
    name: 'email.password',
    fn: () => new local.Strategy({usernameField: 'email', session: false}, async (email, password, callback) => {
      return userService.login(email.toLowerCase(), password.replace(' ', ''))
          .then(u => callback(null, u))
          .catch(e => callback(e));
    }),
  },
];

const configure = (config: { api: { key: string } }, use_strategies: string[] = ['api']) => {
  use_strategies.forEach(name => {
    const strategy = strategies.find(s => s.name === name);

    if (strategy) {
      passport.use(name, strategy.fn(config));
    }
  });
};

export default configure;
