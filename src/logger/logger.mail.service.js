import util from 'util';
import winston from 'winston';
import mail from '../service/mail';

const logger = winston.transports.mail = function(options = {}) {
  this.name = 'mail.service';
  this.level = options.level || 'warn';
};

util.inherits(logger, winston.Transport);

logger.prototype.log = function(level, msg, meta, callback) {
  //enabled only in production
  if (process.env !== 'production') return callback(null, true);

  //exclude api 404
  if (JSON.stringify(meta).match(/Error: API not found/i)) return callback(null, true);

  mail.sendError(msg, level, meta)
      .then(res => callback(null, true))
      .catch(e => callback(e, false));
};

export default logger;

