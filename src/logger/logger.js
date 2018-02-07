import winston from 'winston';
import Mail from './logger.mail.service';

const transports = [
  {
    'name': 'console',
    'fn': new (winston.transports.Console)({
      json: true,
      colorize: true,
      timestamp: true,
    }),
  },
  {
    'name': 'iros-mail',
    'fn': new Mail,
  },
];

let _logger = console;

export const configureLogger = (config, use_transports = ['console', 'iros-mail']) => {
  _logger = new (winston.Logger)({transports: use_transports.map(t => (transports.find(f => f.name === t) || {}).fn).filter(f => f)});
};

const logger = {
  info: (...args) => _logger.info(...args),
  log: (...args) => _logger.log(...args),
  warn: (...args) => _logger.warn(...args),
  error: (...args) => _logger.error(...args),
};

export default logger;