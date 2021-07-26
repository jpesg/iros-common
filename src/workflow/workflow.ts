import _ from 'lodash';
import {EventEmitter} from 'events';
import logger from '../logger/logger';
import WorkflowStep, { WorkflowStepContext } from './workflow.step'

export default class Workflow {
  emitter: EventEmitter;
  steps: WorkflowStep[];
  _uniqueEvents: Record<any, any>;
  _uniqueEventsIdentifier: boolean | string;

  constructor(steps: WorkflowStep[]) {
    this.emitter = new EventEmitter();
    this.steps = steps;
    this._registerListeners(this.emitter, steps);
    this._retrievePersisted();
    this._uniqueEvents = {}
    this._uniqueEventsIdentifier = false
    return this;
  }

  withPeriodicCheck(fn: () => Promise<WorkflowStep[]>, interval: number) {
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

  withUniqueEvents({identifier}: { identifier: string }) {
    this._uniqueEventsIdentifier = identifier;
    return this;
  }

  _uniqueEventsStart(context: WorkflowStepContext) {
    if (!this._uniqueEventsIdentifier) return true;

    if (typeof this._uniqueEventsIdentifier === 'string') {

      if (this._uniqueEvents.hasOwnProperty(context[this._uniqueEventsIdentifier])) return false;

      this._uniqueEvents[context[this._uniqueEventsIdentifier]] = context;
    }

    return true;
  }

  _uniqueEventsFinish(context: WorkflowStepContext) {
    // feature disabled
    if (!this._uniqueEventsIdentifier) return true;

    if (typeof this._uniqueEventsIdentifier === 'string') {
      delete this._uniqueEvents[context[this._uniqueEventsIdentifier]];
    }
    return true;
  }

  // listeners and run
  _registerListeners(emitter: EventEmitter, steps: WorkflowStep[]) {
    this.steps = steps;
    steps.map(step => emitter.on(step.state, this._run(step)));
  }

  _run(step: WorkflowStep) {
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

