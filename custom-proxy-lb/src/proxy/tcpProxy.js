const net = require("net");
const logger = require("../logger/logger");

function createTcpProxy(
    clientSocket,
    backend
) {
    const startTime = Date.now();

    const backendSocket =
        net.createConnection({
            host: backend.host,
            port: backend.port
        });

    backend.incrementConnections();

    backendSocket.on("connect", () => {
        logger.info(
            "TCP connection established",
            {
                backend: backend.id
            }
        );

        clientSocket.pipe(
            backendSocket
        );

        backendSocket.pipe(
            clientSocket
        );
    });

    backendSocket.on("error", error => {
        backend.recordFailure();

        logger.error(
            "TCP backend error",
            {
                backend: backend.id,
                error: error.message
            }
        );

        clientSocket.destroy();
    });

    backendSocket.on("close", () => {
        backend.decrementConnections();

        const latency =
            Date.now() - startTime;

        backend.recordRequest(latency);
    });

    clientSocket.on("error", () => {
        backend.decrementConnections();
    });
}

module.exports = {
    createTcpProxy
}; 