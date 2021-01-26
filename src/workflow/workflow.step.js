export default class WorkflowStep {
  constructor({state, next, fn}) {
    this.state = state;
    this.next = next;
    this.fn = fn;
  }

  async process(context) {
    try {
      const result = await this.fn(context);
      return Promise.resolve({next: this.next, ...result});
    } catch (e) {
      return Promise.reject(e);
    }
  }
}