import EventEmitter from 'node:events';

class VMConsole extends EventEmitter {
    log(...args) {
        console.log(...args);
        this.emit('log', ...args);
    }

    info(...args) {
        console.info(...args);
        this.emit('info', ...args);
    }

    error(...args) {
        console.error(...args);
        this.emit('error', ...args)
    }
}

const vmconsole = new VMConsole();

export default vmconsole