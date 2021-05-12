import {format, createLogger, transports} from 'winston';

let _logger = console;

export const configureLogger = (config) => {
    _logger = createLogger({
        format: format.combine(
            format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            format.json({space: 0}),
        ),
        level: 'info',
        defaultMeta: {app: config?.app},
        transports: [new transports.Console({})],
    });

    return _logger;
};

const logger = {
    info: (...args) => _logger.info(...args),
    log: (...args) => _logger.log(...args),
    warn: (...args) => _logger.warn(...args),
    error: (...args) => _logger.error(...args),
};

export default logger;
