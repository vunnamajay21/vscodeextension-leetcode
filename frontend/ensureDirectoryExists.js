const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(directoryName) {
    const absolutePath = path.resolve(directoryName); // Resolve the absolute path of the directory
    if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true }); // Create the directory and parent directories if necessary
    }
}

module.exports = { ensureDirectoryExists };
