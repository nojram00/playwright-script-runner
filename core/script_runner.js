import vm from 'node:vm'
import { ensureBrowser } from './browser.js';
import logEmitter from './event_pubsub.js';

const HELPERS = {
    url_create : (url_str) => new URL(url_str),
    
}

const console = {
    log: (...message) => { 
        logEmitter.emit("log", message.join(''));
    },
    error: (...message) => {
        logEmitter.emit("error", message.join(""));
    },
    info: (...message) => {
        logEmitter.emit("info", message.join(""));
    }
}

async function executeScript(script) {
    let browser = null;
    let close = null;
    
    try {
        const browserObj = await ensureBrowser();
        browser = browserObj.browser;
        close = browserObj.close;
        
        const vmContext = { browser, close, HELPERS, console };
        vm.createContext(vmContext);

        const result = await vm.runInContext(script, vmContext);
        return result;
    } catch (error) {
        console.error('Script execution error:', error.message);
        throw new Error(`Script execution failed: ${error.message}`);
    } finally {
        // Ensure cleanup happens even if script fails
        if (close) {
            try {
                await close();
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError.message);
            }
        }
    }
}

export {
    executeScript
}

