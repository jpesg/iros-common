import _ from 'lodash';
import {EventEmitter} from 'events';
import logger from '../logger/logger';

export default class Workflow {
  emitter;
  steps;

  constructor(steps) {
    this.emitter = new EventEmitter();
    this._registerListeners(this.emitter, steps);

    return this;
  }

  withUniqueEvents({identifier}) {
    this._uniqueEventsIdenfier = identifier;
    return this;
  }

  withPersistence() {
    this._withPersistence = true;
    this._retrievePersisted();
    return this;
  }

  withPeriodicPersistenceCheck(fn, interval) {
    setInterval(
        async () => ((await fn()) || []).forEach(s => this.emitter.emit(s.state, {...s})),
        interval);
    return this;
  }

  _retrievePersisted() {
    this.steps.reverse().map(async step => {
      ((await step.retrieve()) || []).forEach(s => {
        this.emitter.emit(s.state, {...s});
      });
    });
  }

  _uniqueEvents = {};

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

  _registerListeners(emitter, steps) {
    this.steps = steps;
    steps.map(step => emitter.on(step.state, this._processStep(step)));
    emitter.on('error', logger.error);
  }

  _processStep(step) {
    return ({...context}) => {
      if (!this._uniqueEventsStart(context)) return;
      step[this._withPersistence ? 'processWithPersistence' : 'process'](context)
          .then(({next, ...context}) => {
            this._uniqueEventsFinish(context);
            if (next) this.emitter.emit(next, context);
          })
          .catch(e => this.emitter.emit('error', e));
    };
  }
}

