import WorkflowStep from './workflow.step';

export default class PersistentWorkflowStep extends WorkflowStep {
  constructor({state, next, fn, retrieve, persist}) {
    super({state, next, fn});

    this.retrieve = retrieve;
    this.persist = persist;
  }

  async processWithPersistence(context) {
    return this.process(context)
        .then(result => Promise.all([result, this.persist({...result})]))
        .then(([result]) => result);
  }
}