class Backend {
    constructor(id, host, port) {
        this.id = id;
        this.host = host;
        this.port = port;

        this.activeConnections = 0;

        this.healthy = true;

        this.totalRequests = 0;
        this.failedRequests = 0;
        this.totalLatency = 0;
    }

    incrementConnections() {
        this.activeConnections++;
    }

    decrementConnections() {
        if (this.activeConnections > 0) {
            this.activeConnections--;
        }
    }

    recordRequest(latency) {
        this.totalRequests++;
        this.totalLatency += latency;
    }

    recordFailure() {
        this.failedRequests++;
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
            this.failedRequests /
            this.totalRequests
        ) * 100;
    }
}

module.exports = Backend; 