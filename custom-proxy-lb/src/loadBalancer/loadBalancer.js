class LoadBalancer {
    constructor(backendManager) {
        this.backendManager = backendManager;
    }

    selectBackend() {
        throw new Error(
            "selectBackend() must be implemented"
        );
    }
}

module.exports = LoadBalancer;