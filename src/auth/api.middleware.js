import passport from 'passport';

const authenticate = (req, res, next) =>
    passport.authenticate('api',
        {session: false},
        (err, ok) => {
          if (err || !ok) return next(new Error(err || 'Invalid Key'));

          return next();
        })(req, res, next);

export default authenticate;
