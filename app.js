// const { executeScript } = require('./core/script_runner.js');
import { executeScript } from "./core/script_runner.js";
import express from "express"
import path from "node:path"
import cors from "cors"

const app = express()

app.use(express.text({ type: ['text/plain', 'application/javascript'] }))
app.use(express.json())
app.use(cors())

const js = (str, ...args) => String.raw(str, ...args);

const dist = path.join("./dist")

app.use(express.static(dist))

app.post('/test', async (req, res) => { 
    try {
        let script = null;
        
        // Handle raw text/plain (JavaScript code)
        if (typeof req.body === 'string') {
            script = req.body;
        }
        // Handle JSON with 'script' or 'code' field
        else if (typeof req.body === 'object' && req.body !== null) {
            script = req.body.script || req.body.code;
        }
        
        if (!script || script.trim().length === 0) {
            return res.status(400).json({ error: 'Script body is required' });
        }
        
        const result = await executeScript(script)
        res.json({ 
            status: 'success',
            result: result 
        });
    } catch (error) {
        console.error('POST /test error:', error.message);
        res.status(500).json({ 
            error: 'Script execution failed',
            message: error.message 
        });
    }
});

app.listen(8089, () => { 
    console.log(dist)
    console.log("Server is running")
})