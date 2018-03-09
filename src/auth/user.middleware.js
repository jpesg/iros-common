import userService from '../service/user';
import {UnauthorizedHttpError} from '../errors/http.error';

const authUserRole = (role = 'user', section = null) =>
    (req, res, next) => {
      let auth = req.get('Authorization');

      if (!auth) auth = req.body.jwt || req.query.jwt;

      if (!auth) return next(new UnauthorizedHttpError('Missing Authorization header'));
      if (!auth.match(/^JWT .*$/)) return next(new UnauthorizedHttpError('Only JWT Auth is supported'));

      return userService.canAccess(auth.replace(/^JWT /, ''), role, section)
          .then((u) => {
            req.user = u;
            next();
            return null; // bluebird doesn't like it when we return next(), we need to return null to silence this warning
          })
          .catch(e => next(e));
    };

export default authUserRole;
