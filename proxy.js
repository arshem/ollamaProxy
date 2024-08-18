const express = require('express');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const app = express();
const port = 3006;
const OLLAMA_URL = 'http://localhost:11434/v1/chat/completions';

app.use(express.json())

app.post('/models', (req, res) => {
    // fetch ollama models
    if(checkAuth(req, res)) {
        fetch('http://localhost:11434/api/tags')
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((error) => {
                res.status(500).json(error);
            });
    }
})


app.post('/v1/chat/completions', (req, res) => {
    console.log("Headers: ", req.headers);
    console.log("Body: ", req.body);
    // rebuild the body to ensure everything is there.


    const body = {
        model: req.body.model,
        messages: req.body.messages
    }

    if(req.body.stream)
    {
        body.stream = req.body.stream
    }


    if(checkAuth(req, res)) {
        fetchOllama(body)
            .then((data) => {
                if (body.stream === true) {
                    res.status(200).setHeader('Content-Type', 'application/json'); // Or adjust the Content-Type based on your needs
                    
                    // In case of a streamed response, data is already emitted in chunks
                    // Send the chunks back to the client directly
                    res.write(data);
                    res.end();  // Make sure to end the response after the stream is complete
                } else {
                    // JSON response for non-streaming case
                    res.status(200).json(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                res.status(500).send('Internal Server Error');
            });
    } else {
        res.status(401).send('Unauthorized');
    }
});    

// start your servers
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

async function checkAuth(req, res) {
    // get token from req header "Authorization Bearer <token>"
    const token = req.headers.authorization.split(' ')[1];
    // trim up the whitespace around token
    function trim(str) {
        return str.replace(/^\s+|\s+$/g, '');
    }
    console.log("Token: ", token);
    if (token) {
        // check token
        // look at authTokens.json
        const authTokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'authTokens.json'), 'utf8'));
        if (authTokens.includes(trim(token))) {
            // token is valid
            console.log("Token is valid");
            return true;
        } else {
            res.status(401).send('Unauthorized');
        }
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

async function fetchOllama(body) {
    const isStreaming = body.stream === true;

    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!isStreaming) {
            // Just parse the full response if streaming is not required
            return await response.json();
        } else {
            // Handle streaming response
            console.log("Guess we're streaming...");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                // Decode the stream chunk and process it
                result += decoder.decode(value, { stream: true });
                console.log('Received chunk:', result); // Handle chunk here
            }

            // Process or return the full result when done
            return result;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// let's add a function, not using express that allows CLI input to generate API keys and puts them in authTokens.json
async function generateAPIKey() {
    const uuid = randomUUID();
    const key = `OLLAMA-${uuid}`;
    const authTokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'authTokens.json'), 'utf8'));
    authTokens.push(key);
    fs.writeFileSync(path.join(__dirname, 'authTokens.json'), JSON.stringify(authTokens));
    return key;
}

// start looking for commands from the CLI
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on('line', (input) => {
    if (input === 'exit') {
        process.exit();
    } else if (input === 'generateAPIKey') {
        generateAPIKey();
    } else {
        console.log('Invalid command');
    }
});