const fs = require("fs");
const path = require("path");

const configPath = path.join(
    __dirname,
    "../../config/proxy.json"
);

function loadConfig() {
    try {
        const rawConfig = fs.readFileSync(
            configPath,
            "utf-8"
        );

        return JSON.parse(rawConfig);
    } catch (error) {
        console.error(
            "Failed to load configuration:",
            error.message
        );

        process.exit(1);
    }
}

module.exports = {
    loadConfig
}; 