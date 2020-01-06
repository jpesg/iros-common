import {format, createLogger, transports} from 'winston';
import LoggerMail from './logger.mail.service';

const default_transports = [
  {
    'name': 'console',
    'fn': new transports.Console(),
  },
  {
    'name': 'iros-mail',
    'fn': new LoggerMail(),
  },
];

let _logger = console;

export const configureLogger = (use_transports = ['console', 'iros-mail']) =>
    _logger = createLogger({
      format: format.combine(
          format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
          format.json({space: 2}),
          format.colorize({all: true}),
      ),
      transports: use_transports.map(t => (default_transports.find(f => f.name === t) || {}).fn).filter(f => f),
    });

const logger = {
  info: (...args) => _logger.info(...args),
  log: (...args) => _logger.log(...args),
  warn: (...args) => _logger.warn(...args),
  error: (...args) => _logger.error(...args),
};

export default logger;