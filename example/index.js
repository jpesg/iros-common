import express from 'express';

// config should be imported before importing any other file
import config from './config';

//import config helpers
import {configureLogger, configureAuth, configureApp, configureServices, configureMongoose, authApi, mailService} from 'comunik8-common';

// init logs
configureLogger();

// init auth
configureAuth(config);

// init database
configureMongoose(config);

// init services
configureServices(config.service);

// configure routes
const router = express.Router();
router.get('/auth-only',
    // api authentication
    authApi, (req, res) => res.json({}));
router.post('/send-mail',
    // service usage
    (req, res, next) => mailService.send({
      sender: 'test@domain.com', from: 'Test ACC <test@domain.com>', to: 'example@domain.com',
      subject: 'sample email', html: '<div>Hello World</div>', text: 'hello world',
    }));

// init app
const app = configureApp(router);

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`);
  });
}

//configure workers

import {Worker} from 'comunik8-common';
const worker = new Worker({
  tasks: {
    runEverySecond: {
      module: `${__dirname}/task`,
      command: 'run',
      interval: 1000,
    },
  },
});

setInterval(() => {
  console.log(JSON.stringify(worker.stats()));
}, 1000);

export default app;
