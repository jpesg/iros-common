import _ from 'lodash';
import {EventEmitter} from 'events';
import logger from '../logger/logger';

export default class Workflow {
  emitter;
  steps;

  constructor(steps) {
    this.emitter = new EventEmitter();
    this._registerListeners(this.emitter, steps);
    this._retrievePersisted();

    return this;
  }

  withPeriodicCheck(fn, interval) {
    setInterval(async () => ((await fn()) || []).forEach(s => this.emitter.emit(s.state, {...s})), interval);
    return this;
  }

  // retrieve all unfinished on app start
  _retrievePersisted() {
    this.steps.reverse().map(async step => {
      ((await step.retrieveAll()) || []).forEach(s => {
        this.emitter.emit(s.state, {...s});
      });
    });
  }

  // unique identifiers
  _uniqueEvents = {};
  _uniqueEventsIdentifier = false;

  withUniqueEvents({identifier}) {
    this._uniqueEventsIdenfier = identifier;
    return this;
  }

  _uniqueEventsStart(context) {
    if (!this._uniqueEventsIdenfier) return true;

    if (this._uniqueEvents.hasOwnProperty(context[this._uniqueEventsIdenfier])) return false;

    this._uniqueEvents[context[this._uniqueEventsIdenfier]] = context;
    return true;
  }

  _uniqueEventsFinish(context) {
    // feature disabled
    if (!this._uniqueEventsIdenfier) return true;

    delete this._uniqueEvents[context[this._uniqueEventsIdenfier]];
    return true;
  }

  // listeners and run
  _registerListeners(emitter, steps) {
    this.steps = steps;
    steps.map(step => emitter.on(step.state, this._run(step)));
  }

  _run(step) {
    return ({...context}) => {
      if (!this._uniqueEventsStart(context)) return;
      step.run(context)
          .then(({_next, ...persistedContext}) => {
            this._uniqueEventsFinish(context);
            if (_next) this.emitter.emit(_next, persistedContext);
          })
          .catch(e => {
            logger.error('workflow step failed', {e});
            return this.emitter.emit('error', e);
          });
    };
  }
}

