const net = require("net");

const {
    parseHttpRequest
} = require("./requestParser");

const logger =
    require("../logger/logger");

class ProxyServer {

    constructor(
        config,
        loadBalancer,
        metricsCollector
    ) {
        this.config = config;

        this.loadBalancer =
            loadBalancer;

        this.metricsCollector =
            metricsCollector;

        this.server = null;
    }

    start() {

        this.server =
            net.createServer(
                (clientSocket) => {
                    this.handleConnection(
                        clientSocket
                    );
                }
            );

        this.server.listen(
            this.config.proxy.port,
            this.config.proxy.host,
            () => {

                logger.info(
                    "Proxy server started",
                    {
                        host:
                            this.config.proxy.host,

                        port:
                            this.config.proxy.port
                    }
                );
            }
        );

        this.server.on(
            "error",
            (error) => {

                logger.error(
                    "Proxy server error",
                    {
                        error:
                            error.message
                    }
                );
            }
        );
    }

    handleConnection(clientSocket) {

        /*
         * Select a backend for this
         * incoming connection.
         */
        const backend =
            this.loadBalancer
                .selectBackend();

        /*
         * No healthy backend available.
         */
        if (!backend) {

            logger.error(
                "No healthy backend available"
            );

            this.metricsCollector
                .recordError();

            clientSocket.end(
                "HTTP/1.1 503 Service Unavailable\r\n" +
                "Content-Type: text/plain\r\n" +
                "Content-Length: 19\r\n" +
                "Connection: close\r\n" +
                "\r\n" +
                "Service Unavailable"
            );

            return;
        }

        /*
         * Start measuring the time taken
         * by this connection/request.
         */
        const startTime =
            Date.now();

        /*
         * Track the connection on the
         * selected backend.
         */
        backend.incrementConnections();

        logger.info(
            "Incoming connection",
            {
                remoteAddress:
                    clientSocket.remoteAddress,

                remotePort:
                    clientSocket.remotePort,

                backend:
                    backend.id
            }
        );

        let firstChunk = true;

        /*
         * Receive data from the client.
         */
        clientSocket.on(
            "data",
            (data) => {

                /*
                 * We inspect only the first
                 * chunk for HTTP information.
                 *
                 * We will improve this later
                 * with proper TCP buffering.
                 */
                if (firstChunk) {

                    firstChunk = false;

                    const request =
                        parseHttpRequest(data);

                    if (request) {

                        logger.info(
                            "HTTP request",
                            {
                                method:
                                    request.method,

                                path:
                                    request.path,

                                version:
                                    request.version,

                                backend:
                                    backend.id
                            }
                        );
                    }

                    /*
                     * Connect to the selected
                     * backend.
                     */
                    this.connectToBackend(
                        clientSocket,
                        data,
                        backend,
                        startTime
                    );
                }
            }
        );

        clientSocket.on(
            "error",
            (error) => {

                logger.error(
                    "Client socket error",
                    {
                        backend:
                            backend.id,

                        error:
                            error.message
                    }
                );
            }
        );

        clientSocket.on(
            "close",
            () => {

                logger.info(
                    "Client disconnected",
                    {
                        backend:
                            backend.id
                    }
                );
            }
        );
    }

    connectToBackend(
        clientSocket,
        initialData,
        backend,
        startTime
    ) {

        /*
         * Create a TCP connection to the
         * selected backend server.
         */
        const backendSocket =
            net.createConnection(
                {
                    host:
                        backend.host,

                    port:
                        backend.port
                }
            );

        backendSocket.on(
            "connect",
            () => {

                logger.info(
                    "Connected to backend",
                    {
                        backend:
                            backend.id,

                        host:
                            backend.host,

                        port:
                            backend.port
                    }
                );

                /*
                 * The first chunk was already
                 * received before the backend
                 * connection was established.
                 *
                 * Send it manually.
                 */
                backendSocket.write(
                    initialData
                );

                /*
                 * From this point onward,
                 * forward client data directly
                 * to the backend.
                 */
                clientSocket.pipe(
                    backendSocket
                );

                /*
                 * Forward backend responses
                 * back to the client.
                 */
                backendSocket.pipe(
                    clientSocket
                );
            }
        );

        backendSocket.on(
            "error",
            (error) => {

                /*
                 * Backend failed.
                 */
                backend.recordFailure();

                this.metricsCollector
                    .recordError();

                logger.error(
                    "Backend connection error",
                    {
                        backend:
                            backend.id,

                        host:
                            backend.host,

                        port:
                            backend.port,

                        error:
                            error.message
                    }
                );

                /*
                 * If the client is still
                 * connected, return a
                 * 502 response.
                 */
                if (
                    !clientSocket.destroyed
                ) {

                    clientSocket.end(
                        "HTTP/1.1 502 Bad Gateway\r\n" +
                        "Content-Type: text/plain\r\n" +
                        "Content-Length: 11\r\n" +
                        "Connection: close\r\n" +
                        "\r\n" +
                        "Bad Gateway"
                    );
                }
            }
        );

        backendSocket.on(
            "close",
            () => {

                /*
                 * Connection is no longer
                 * active.
                 */
                backend.decrementConnections();

                /*
                 * Calculate how long the
                 * connection took.
                 */
                const latency =
                    Date.now() - startTime;

                /*
                 * Update backend-specific
                 * statistics.
                 */
                backend.recordRequest(
                    latency
                );

                /*
                 * Update global metrics.
                 */
                this.metricsCollector
                    .recordRequest(
                        latency
                    );

                logger.info(
                    "Request completed",
                    {
                        backend:
                            backend.id,

                        latency:
                            latency
                    }
                );
            }
        );
    }
}

module.exports = ProxyServer;