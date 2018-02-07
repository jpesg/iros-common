import passport from 'passport';
import LocalStrategy from 'passport-local';
import BearerStrategy from 'passport-local';
import userService from '../service/user';

const strategies = [
  {
    name: 'api',
    fn: (config) => new BearerStrategy((key, callback) => {
      if (!key || !key.length) return callback('Empty Access Key');
      if (key !== config.accessKey) return callback('Invalid Access Key');

      return callback(null, true);
    }),
  },
  {
    name: 'email.password',
    fn: (config) => new LocalStrategy({usernameField: 'email', session: false}, (email, password, callback) => {
      return userService.login(email.toLowerCase, password.replace(' ', ''))
          .then(u => callback(null, u))
          .catch(e => callback(e));
    }),
  },
];

const configure = (config, use_strategies = ['api']) => {
  use_strategies.forEach(name => {
    const strategy = strategies.find(s => s.name === name);
    if (strategy) passport.use(name, strategy.fn(config));
  });
};

export default configure;