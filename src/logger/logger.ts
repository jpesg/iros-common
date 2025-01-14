import {format, createLogger, transports, Logger as WinstonLogger} from 'winston';
const {EOL} = require('os');

let _logger: Console | WinstonLogger = console;

type LoggerCall = (message: string, data?: Record<string, unknown>) => void

type IrosLogger = {
  debug: LoggerCall
  info: LoggerCall
  log: LoggerCall
  warn: LoggerCall
  error: LoggerCall
}

export const configureLogger = (config?: any) => {
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

const safeStringify = (obj: Record<string, unknown>, indent: number = 2) => {
    try {
        let cache: null | unknown[] = [];

        const retVal = JSON.stringify(
            obj,
            (_, value) => {
                if (value instanceof Error && !cache?.includes(value)) {
                    cache?.push(value);
                    return Object.getOwnPropertyNames(value).reduce((_out, key) => key !== 'stack' ? ({..._out, [key]: (value as any)[key]}): _out, {});
                }
                return typeof value === 'object' && value !== null ? cache?.includes(value) ? undefined : cache?.push(value) && value : value
            },
            indent
        );

        cache = null;

        return retVal;
    } catch (e) {
        // Suppress eny errors here
    }
};

const logger: IrosLogger = {
    debug: (message, data) => _logger.info({
        message,
        ...getCaller(),
        ...(data && {data: safeStringify(data)})
    }),
    info: (message, data) => _logger.info({
        message,
        ...getCaller(),
        ...(data && {data: safeStringify(data)})
    }),
    log: (message, data) => _logger.log({
        message,
        ...getCaller(),
        level: 'info',
        ...(data && {data: safeStringify(data)})
    }),
    warn: (message, data) => _logger.warn({
        message,
        ...getCaller(),
        ...(data && {data: safeStringify(data)})
    }),
    error: (message, data) => _logger.error({
        message,
        ...getCaller(),
        ...(data && {data: safeStringify(data)})
    })
};

export default logger;
