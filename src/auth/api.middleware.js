import passport from 'passport';

const authenticate = (req, res, next) => {
  passport.authenticate('bearer', {session: false}, function(err, ok) {
    if (err || !ok) return res.status(401).json({message: 'Unauthorized', error: err || 'Invalid Key'});

    return next();
  })(req, res, next);
};

export default authenticate
