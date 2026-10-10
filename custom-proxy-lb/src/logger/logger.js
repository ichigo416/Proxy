const fs = require("fs");
const path = require("path");

const logDirectory = path.join(
    __dirname,
    "../../logs"
);

const logFile = path.join(
    logDirectory,
    "proxy.log"
);

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, {
        recursive: true
    });
}

function formatMessage(level, message, metadata = {}) {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...metadata
    });
}

function writeLog(level, message, metadata = {}) {
    const formatted = formatMessage(
        level,
        message,
        metadata
    );

    console.log(formatted);

    fs.appendFileSync(
        logFile,
        formatted + "\n"
    );
}

function info(message, metadata = {}) {
    writeLog(
        "INFO",
        message,
        metadata
    );
}

function warn(message, metadata = {}) {
    writeLog(
        "WARN",
        message,
        metadata
    );
}

function error(message, metadata = {}) {
    writeLog(
        "ERROR",
        message,
        metadata
    );
}

module.exports = {
    info,
    warn,
    error
}; 