import EventEmitter from 'node:events';

class VMConsole extends EventEmitter {
    log(...args) {
        console.log(...args);
        this.emit('log', args.join(''));
    }

    info(...args) {
        console.info(...args);
        this.emit('info', args.join(''));
    }

    warn(...args) {
        console.warn(...args);
        this.emit('warn', args.join(''));
    }

    error(...args) {
        console.error(...args);
        this.emit('error', args.join(''))
    }
}

const vmconsole = new VMConsole();

export default vmconsole