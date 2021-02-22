import WorkflowStep from './workflow.step';
import _ from 'lodash';

export default class PersistentWorkflowStep extends WorkflowStep {
  constructor({state, next, fn, retrieve, persist}) {
    super({state, next, fn});

    this.retrieve = retrieve;
    this.persist = persist;
  }

  async processWithPersistence(context) {
    return this.process(context)
        .then(result => {
          // allow to split {result,persist}
          const {persist, result: _result} = result;
          if (!_.isEmpty(persist) && !_.isEmpty(_result)) {
            return Promise.all([_result, this.persist(persist)]);
          }

          return Promise.all([result, this.persist({...result})]);
        })
        .then(([result]) => result);
  }
}