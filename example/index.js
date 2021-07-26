import {express} from 'iros-common';

// Config should be imported before importing any other file
import config from './config';

//Import config helpers
import {configureLogger, configureAuth, configureApp, configureServices, configureMongoose, authApi, mailService, logger, validate} from 'iros-common';
import validationSchema from './validation';

// Init logs
configureLogger();

// Init auth
configureAuth(config);

// Init database
configureMongoose(config);

// Init services
configureServices(config.service, config.app);

// Configure routes
const router = express.Router();

// Validation
router.post(
    '/validation',
    validate({body: validationSchema}),
    (req, res) => res.json(req.body),
);

router.get(
    '/auth-only',
    // Api authentication
    authApi,
    (req, res) => res.json({}),
);
router.post(
    '/send-mail',
    // Service usage
    () => mailService.send({
        sender: 'test@domain.com',
        from: 'Test ACC <test@domain.com>',
        to: 'example@domain.com',
        subject: 'sample email',
        html: '<div>Hello World</div>',
        text: 'hello world',
    }),
);

// Init app
const app = configureApp(router);

/*
 * Module.parent check is required to support mocha watch
 * src: https://github.com/mochajs/mocha/issues/1912
 */
if (!module.parent) {
    // Listen on port config.port
    app.listen(config.port, () => {
        logger.info(`server started on port ${config.port} (${config.env})`);
    });
}

//Configure workers
/*
 *import {Worker} from 'iros-common';
 *const worker = new Worker({
 *  maxWorkers: 1,
 *  tasks: {
 *    runEverySecond: {
 *      module: `${__dirname}/task`,
 *      command: 'run',
 *      delay: 1000,
 *    },
 *  },
 *});
 */

//configure workflow
/*
 *import {Workflow, WorkflowStep} from 'iros-common';
 *
 *const steps = [
 *  new WorkflowStep({state: 'A', next: 'B', fn: context => Promise.resolve(context)}),
 *  new WorkflowStep({state: 'B', fn: context => Promise.resolve({...context, next: 'C'})}),
 *  new WorkflowStep({state: 'C', next: 'D', fn: context => Promise.resolve(context)}),
 *];
 *const workflow = new Workflow(steps)
 */

export default app;
