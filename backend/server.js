const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0]; // Strip query parameters

    // 1.5 Favicon Fallback Router
    if (urlPath === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 2. Static File Router (Serving out of sibling 'frontend/' directory)
    let relativeFilePath = urlPath === '/' ? 'index.html' : urlPath;
    let filePath = path.join(__dirname, '..', 'frontend', relativeFilePath);

    // Prevent directory traversal attacks
    const frontendDir = path.join(__dirname, '..', 'frontend');
    if (!filePath.startsWith(frontendDir)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.message);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
