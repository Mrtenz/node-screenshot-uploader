const fs = require('fs');
const path = require('path');
const express = require('express');
const multipart = require('connect-multiparty');
const bodyParser = require('body-parser');
const sharp = require('sharp');

const BASE_URL = process.env.SCREENSHOT_BASE_URL;
const KEY = process.env.SCREENSHOT_KEY;
const PORT = process.env.SCREENSHOT_PORT;

const app = express();

app.post('/', bodyParser.urlencoded({extended: false}), multipart(), (request, response) => {
    if (!request.body.key || request.body.key !== KEY) {
        response.status(403);
        return response.end('Forbidden');
    }

    if (request.files && request.files.screenshot) {
        const screenshot = request.files.screenshot;
        const filename = Math.random().toString(36).slice(2) + '.png';
        const output = path.join(__dirname, 'screenshots', filename);

        sharp(screenshot.path)
            .png()
            .toFile(output, (error) => {
                if (error) {
                    response.status(500);
                    return response.end('Internal server error');
                }
                return response.end(BASE_URL + filename);
            });
    } else {
        response.status(400);
        response.end('Bad request');
    }
});

app.get('/:image', (request, response) => {
    const file = path.join(__dirname, 'screenshots', request.params.image);
    const stream = fs.createReadStream(file);
    stream.on('open', () => {
        response.set('Content-Type', 'image/png');
        stream.pipe(response);
    });

    stream.on('error', () => {
        response.status(404);
        response.end('Not found');
    });
});

app.get('*', (request, response) => {
    response.status(404);
    response.end('Not found');
});

app.listen(PORT);
