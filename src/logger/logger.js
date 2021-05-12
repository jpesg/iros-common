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
    info: (...args) => _logger.info(...args, getCaller()),
    log: (...args) => _logger.log(...args, getCaller()),
    warn: (...args) => _logger.warn(...args, getCaller()),
    error: (...args) => _logger.error(...args, getCaller()),
};

export default logger;
