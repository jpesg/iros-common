import {logger} from '../index';

export default class WorkflowStep {

    /**
     *
     * @param state
     * @param process - should calculate new values - should return {context, _next}
     * @param persist - should contain a function to save everything from processed then retrieve persisted - should return {context}
     * @param retrieveAll - should return all for this workflow (runs only after an app starts)
     */
    constructor({state, process, persist, retrieveAll}) {
        [
            process,
            persist,
            retrieveAll
        ].forEach(fn => {
            if (typeof fn !== 'function') {
                logger.error('failed to create workflow step', {
                    e: `${fn} is not a function but ${typeof fn}`,
                    name
                });
                throw new Error('not a function');
            }
        });

        this.state = state;
        this.process = process;
        this.persist = persist;
        this.retrieveAll = retrieveAll;
    }

    async run(context) {
        const {_next, ...processedContext} = await this.process(context),
            persistedContext = await this.persist(processedContext);

        return Promise.resolve({
            ...persistedContext,
            _next
        });
    }
}
