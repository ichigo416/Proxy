const LoadBalancer = require("./loadBalancer");

class RoundRobin extends LoadBalancer {
    constructor(backendManager) {
        super(backendManager);

        this.currentIndex = 0;
    }

    selectBackend() {
        const backends =
            this.backendManager.getHealthyBackends();

        if (backends.length === 0) {
            return null;
        }

        const backend =
            backends[
                this.currentIndex %
                backends.length
            ];

        this.currentIndex =
            (this.currentIndex + 1) %
            backends.length;

        return backend;
    }
}

module.exports = RoundRobin; 