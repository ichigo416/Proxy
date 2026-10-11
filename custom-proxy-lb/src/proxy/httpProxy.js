const http = require("http");
const { parseHttpRequest } = require("./requestParser");
const logger = require("../logger/logger");

function forwardHttpRequest(
    clientSocket,
    backend
) {
    const startTime = Date.now();

    const backendSocket = require("net").createConnection(
        {
            host: backend.host,
            port: backend.port
        }
    );

    backend.incrementConnections();

    backendSocket.on("connect", () => {
        logger.info(
            "Connected to backend",
            {
                backend: backend.id
            }
        );

        clientSocket.pipe(backendSocket);
        backendSocket.pipe(clientSocket);
    });

    backendSocket.on("error", error => {
        backend.recordFailure();

        logger.error(
            "Backend connection failed",
            {
                backend: backend.id,
                error: error.message
            }
        );

        if (!clientSocket.destroyed) {
            clientSocket.end(
                "HTTP/1.1 502 Bad Gateway\r\n\r\n"
            );
        }
    });

    backendSocket.on("close", () => {
        backend.decrementConnections();

        const latency =
            Date.now() - startTime;

        backend.recordRequest(latency);

        logger.info(
            "Request completed",
            {
                backend: backend.id,
                latency
            }
        );
    });
}

module.exports = {
    forwardHttpRequest
}; 