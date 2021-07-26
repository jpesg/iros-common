export type WorkflowStepContext = Record<string, string>

type ProcessFunction = (context: WorkflowStepContext) => Promise<{ context: WorkflowStepContext, _next: string }>
type PersistFunction = (wrappedContext: { context: WorkflowStepContext }) => Promise<{ context: WorkflowStepContext }>
type WorkflowStepConstructor = {
    state: string
    process: ProcessFunction
    persist: PersistFunction
    retrieveAll: () => Promise<WorkflowStep[]>
}

export default class WorkflowStep {
    state: string;
    process: (context: WorkflowStepContext) => Promise<{ context: WorkflowStepContext, _next: string }>
    persist: (wrappedContext: { context: WorkflowStepContext }) => Promise<{ context: WorkflowStepContext }>
    retrieveAll: () => Promise<WorkflowStep[]>

    /**
     *
     * @param state
     * @param process - should calculate new values - should return {context, _next}
     * @param persist - should contain a function to save everything from processed then retrieve persisted - should return {context}
     * @param retrieveAll - should return all for this workflow (runs only after an app starts)
     */
    constructor({state, process, persist, retrieveAll}: WorkflowStepConstructor) {
        this.state = state;
        this.process = process;
        this.persist = persist;
        this.retrieveAll = retrieveAll;
    }

    async run(context: WorkflowStepContext) {
        const {_next, ...processedContext} = await this.process(context),
            persistedContext = await this.persist(processedContext);

        return Promise.resolve({
            ...persistedContext,
            _next
        });
    }
}
