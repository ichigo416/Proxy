const http = require("http");

function startMetricsServer(
    config,
    metricsCollector
) {
    const server =
        http.createServer(
            (req, res) => {
                if (
                    req.url ===
                    "/metrics"
                ) {
                    const metrics =
                        metricsCollector
                            .getMetrics();

                    res.writeHead(
                        200,
                        {
                            "Content-Type":
                                "application/json"
                        }
                    );

                    res.end(
                        JSON.stringify(
                            metrics,
                            null,
                            2
                        )
                    );

                    return;
                }

                res.writeHead(404);

                res.end(
                    "Not Found"
                );
            }
        );

    server.listen(
        config.metrics.port,
        config.metrics.host,
        () => {
            console.log(
                `Metrics server running on ${config.metrics.port}`
            );
        }
    );

    return server;
}

module.exports = {
    startMetricsServer
}; 