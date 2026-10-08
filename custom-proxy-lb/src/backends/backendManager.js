const Backend = require("./backend");

class BackendManager {
    constructor(config) {
        this.backends = config.backends.map(
            backend =>
                new Backend(
                    backend.id,
                    backend.host,
                    backend.port
                )
        );
    }

    getBackends() {
        return this.backends;
    }

    getHealthyBackends() {
        return this.backends.filter(
            backend => backend.healthy
        );
    }

    getBackendById(id) {
        return this.backends.find(
            backend => backend.id === id
        );
    }

    markHealthy(id) {
        const backend = this.getBackendById(id);

        if (backend) {
            backend.healthy = true;
        }
    }

    markUnhealthy(id) {
        const backend = this.getBackendById(id);

        if (backend) {
            backend.healthy = false;
        }
    }
}

module.exports = BackendManager;