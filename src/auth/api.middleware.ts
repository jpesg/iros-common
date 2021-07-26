import passport from 'passport';
import { RequestHandler } from 'express';
import {UnauthorizedHttpError} from '../errors/http.error';

const authenticate: RequestHandler = (req, res, next) =>
    passport.authenticate('api', {session: false},
        (err, ok) => {
          if (err || !ok) return next(new UnauthorizedHttpError(err || 'Invalid Key'));

          return next();
        })(req, res, next);

export default authenticate;
