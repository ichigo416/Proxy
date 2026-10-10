class MetricsCollector {
    constructor(backendManager) {
        this.backendManager =
            backendManager;

        this.totalRequests = 0;
        this.totalErrors = 0;
        this.totalLatency = 0;
    }

    recordRequest(latency) {
        this.totalRequests++;
        this.totalLatency += latency;
    }

    recordError() {
        this.totalErrors++;
    }

    getAverageLatency() {
        if (this.totalRequests === 0) {
            return 0;
        }

        return (
            this.totalLatency /
            this.totalRequests
        );
    }

    getErrorRate() {
        if (this.totalRequests === 0) {
            return 0;
        }

        return (
            this.totalErrors /
            this.totalRequests
        ) * 100;
    }

    getMetrics() {
        return {
            totalRequests:
                this.totalRequests,

            totalErrors:
                this.totalErrors,

            averageLatency:
                this.getAverageLatency(),

            errorRate:
                this.getErrorRate(),

            backends:
                this.backendManager
                    .getBackends()
                    .map(backend => ({
                        id: backend.id,
                        host: backend.host,
                        port: backend.port,
                        healthy: backend.healthy,
                        activeConnections:
                            backend.activeConnections,
                        totalRequests:
                            backend.totalRequests,
                        failedRequests:
                            backend.failedRequests,
                        averageLatency:
                            backend.getAverageLatency(),
                        errorRate:
                            backend.getErrorRate()
                    }))
        };
    }
}

module.exports = MetricsCollector;