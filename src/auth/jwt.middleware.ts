import type {Role} from '../types/role'
import type {RequestHandler} from 'express';
import userService from '../service/user';
import {UnauthorizedHttpError} from '../errors/http.error';
import jsonwebtoken, {JwtPayload} from 'jsonwebtoken';

const authenticate = (role: Role = 'user', section?: string): RequestHandler => {
  return (req, _, next) => {
    let auth = req.get('Authorization');

    if (!auth) auth = req.body.jwt;

    if (!auth) return next(new UnauthorizedHttpError('Missing Authorization header'));
    if (!auth.match(/^JWT .*$/)) return next(new UnauthorizedHttpError('Only JWT Auth is supported'));

    const jwt = auth.replace(/^JWT /, '');
    const {company} = jsonwebtoken.decode(jwt) as JwtPayload;

    return userService.canAccess(jwt, role, section)
        .then(u => {
          req.user = {...u, company, jwt};
          next();
          return null; // bluebird doesn't like it when we return next(), we need to return null to silence this warning
        })
        .catch(e => next(e));
  };
};

export default authenticate;
