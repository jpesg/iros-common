import Transport from 'winston-transport';
import mail from '../service/mail';

class Mail extends Transport {
  constructor(opts) {
    super(opts);
    this.name = 'Mail';
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    return callback(null, true);

    //todo implement 3rd party service

    //enabled only in production
    if (process.env !== 'production') return callback(null, true);

    //exclude api 404
    if (JSON.stringify(message).match(/Error: API not found/i)) return callback(null, true);
  }
}

export default Mail;

