const LoadBalancer = require("./loadBalancer");

class LeastConnections extends LoadBalancer {
    constructor(backendManager) {
        super(backendManager);
    }

    selectBackend() {
        const backends =
            this.backendManager.getHealthyBackends();

        if (backends.length === 0) {
            return null;
        }

        return backends.reduce(
            (least, backend) => {
                if (
                    backend.activeConnections <
                    least.activeConnections
                ) {
                    return backend;
                }

                return least;
            }
        );
    }
}

module.exports = LeastConnections; 