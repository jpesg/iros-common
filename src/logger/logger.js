import {format, createLogger, transports} from 'winston';
const {EOL} = require('os');

let _logger = console;

export const configureLogger = (config) => {
    _logger = createLogger({
        format: format.combine(
            format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            format.json({space: 0}),
        ),
        depth: true,

        level: 'info',
        defaultMeta: {app: config?.app},
        transports: [new transports.Console({})],
    });

    return _logger;
};

function getCaller() {
    try {
        throw new Error();
    } catch (e) {

        const rows = e.stack.split(EOL);
        if (!rows.hasOwnProperty(3)) {
            return {};
        }

        const match = rows[3].match(/at (?<function>.*) \((?<file>[^):]+):.*\)/);
        if (!match || !match?.groups) {
            return {};
        }

        return {
            function: match.groups.function,
            file: match.groups.file.replace(`${__dirname.replace('/node_modules/iros-common/dist/logger', '')}/dist`, '')
        };
    }
}


const logger = {
    debug: (message, ...data) => _logger.info({
        message,
        ...getCaller(),
        data: JSON.stringify(data)
    }),
    info: (message, ...data) => _logger.info({
        message,
        ...getCaller(),
        data: JSON.stringify(data)
    }),
    log: (message, ...data) => _logger.log({
        message,
        ...getCaller(),
        data: JSON.stringify(data)
    }),
    warn: (message, ...data) => _logger.warn({
        message,
        ...getCaller(),
        data: JSON.stringify(data)
    }),
    error: (message, ...data) => _logger.error({
        message,
        ...getCaller(),
        data: JSON.stringify(data)
    }),
};

export default logger;
