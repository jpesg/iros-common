import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import httpStatus from 'http-status';
import helmet from 'helmet';
import {NotFoundHttpError} from '../errors/http.error';
import HttpError, { IHttpError } from '../errors/http.error';

type StaticPathConfig = {
    path: string
    folder: string
}

const configureApp = (routes: express.Router, staticPath: null | StaticPathConfig[] = null) => {
    const app = express(),
        dev = process.env.NODE_ENV === 'development';

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(methodOverride());
    app.use(helmet());
    app.use(cors());

    // Mount all routes on / path
    app.use('/', routes);

    // Mount static files
    if (staticPath !== null) {
        if (Array.isArray(staticPath)) {
            staticPath.forEach(({path, folder}) => {
                app.use(path, express.static(folder));
            });
        }

        if (typeof staticPath === 'string') {
            app.use('/static', express.static(staticPath));
        }
    }

    // If error is not an instanceOf HttpError, convert it.
    app.use((err: IHttpError, _: express.Request, _1: express.Response, next: express.NextFunction) => {
        if (!(err instanceof HttpError) && !dev) {
            return next(new HttpError(err.message, err.isPublic, err.errors, err.status || httpStatus.INTERNAL_SERVER_ERROR));
        }

        return next(err);
    });

    // Catch 404 and forward to error handler
    app.use((_, _1, next) => next(new NotFoundHttpError('API not found')));

    // Error handler, send stacktrace only during development
    app.use((err: IHttpError, _: express.Request, res: express.Response, _1: express.NextFunction) => {
        const status = httpStatus[err.status] || httpStatus[500];

        return res.status(err.status || 500).json({
            message: err.isPublic ? err.message : status,
            stack: dev ? err.stack : {},
            errors: err.errors || {},
            isPublic: err.isPublic || false,
            status: err.status || 500,
        });
    });

    // Insecure requests are ok in development
    if (dev) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    return app;
};

export default configureApp;
