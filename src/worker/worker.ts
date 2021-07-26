import {SkipWorkerError} from '../errors/worker.error';
import type {Module, Command} from './pool'

type Status 
    = 'init'
    | 'waiting'
    | 'preparing'
    | 'working'
    | 'finish'

const send = (type: Status, error?: string) => process.send?.({
    type,
    error
})

const waiting = () => send('waiting');
const failed = (e: Error) => send('finish', e.message || 'Unknown error');
const finished = () => send('finish');

type ExecMessage = {
    type: 'exec',
    module: Module,
    command: Command
}

type Message
    = { type: 'none' }
    | ExecMessage

const exec = (module: Module, command: Command) => {
    send('working');

    const mod = require(module);
    if (!mod) {
        return failed(new Error(`Module ${module} not found!`));
    }

    const fn = mod[command];
    if (typeof fn !== 'function') {
        return failed(new Error(`Command ${command} not found!`));
    }

    try {
        return fn()
            .then(() => finished())
            .catch((e: unknown) => {
                if (e instanceof SkipWorkerError) {
                    return finished();
                }

                failed(e as Error);
            });
    } catch (e) {
        failed(e);
    }
};

process.on('message', (e: Message) => {
    switch (e.type) {
        case 'exec':
            return exec(e.module, e.command);
    }
});

waiting();
