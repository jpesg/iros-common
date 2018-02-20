import request from 'request-promise';

let service = {};
let app = 'unknown';

const configure = (config) => {
  service = config.user;
  app = config.app;
};

function login(email, password) {
  return post('/auth/password', {email, password});
}

function canAccess(jwt, app, role = 'user', section = null) {
  return get('/user/can-access', {app, section, role}, {
    headers: {
      'Authorization': `JWT ${jwt}`,
    },
  });
}

function post(path, data, override_options = {}) {
  return send({
    ...{
      method: 'POST',
      uri: `${service.url}${path}`,
      body: data,
      json: true,
    },
    ...override_options
  });
}

function get(path, data = {}, override_options = {}) {
  return send({
    ...{
      method: 'GET',
      uri: `${service.url}${path}?${Object.keys(data).map((key) => `${key}=${data[key]}`).join('&')}`,
      json: true,
    },
    ...override_options
  });
}

function do_delete(path, data, override_options = {}) {
  return send({
    ...{
      method: 'DELETE',
      uri: `${service.url}${path}`,
      body: data,
      json: true,
    },
    ...override_options
  });
}

function send(options) {

  return request(options)
      .then(body => body)
      .catch(err => {
        const message = err.error && err.error.message ? err.error.message : 'Failed to request User Service';
        return Promise.reject(new Error(message, err.statusCode, true));
      });

}

function requestPasswordReset(email) {
  return post('/auth/password/request-reset', {email});
}

function resetPassword(email, token, password) {
  return post('/auth/password/reset', {email, token, password});
}

function getUsers(jwt) {
  return get('/user/all', {}, {
    headers: {
      'Authorization': jwt,
    },
  });
}

function createUser(email, jwt) {
  return post('/user', {email: email}, {
    headers: {
      'Authorization': jwt,
    },
  });
}

function deleteUser(email, jwt) {
  return get('/user', {email: email}, {headers: {'Authorization': jwt,}})
      .then(user => {
        const roles = user.roles.filter(role => role.app === app);

        return Promise.all(roles.map(role => deleteRole(user.email, role.role, role.section, jwt)))
            .then(result => result[result.length - 1]);
      });
}

function addRole(email, role, section, jwt) {
  const data = {email, app, role, section};

  return post('/user/role', data, {
    headers: {
      'Authorization': jwt,
    },
  });
}

function deleteRole(email, role, section, jwt) {
  const data = {email: email, app, role: role};
  if (section) data.section = section;
  return do_delete('/user/role', data, {
    headers: {
      'Authorization': jwt,
    },
  });
}

export default {login, canAccess, requestPasswordReset, resetPassword, getUsers, createUser, addRole, deleteRole, deleteUser, configure};
