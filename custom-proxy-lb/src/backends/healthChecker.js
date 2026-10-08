const net = require("net");

class HealthChecker {
    constructor(
        backendManager,
        config
    ) {
        this.backendManager =
            backendManager;

        this.config = config;

        this.timer = null;
    }

    start() {
        if (
            !this.config.healthCheck.enabled
        ) {
            return;
        }

        this.checkAll();

        this.timer = setInterval(
            () => {
                this.checkAll();
            },
            this.config.healthCheck
                .interval
        );
    }

    checkAll() {
        const backends =
            this.backendManager
                .getBackends();

        for (const backend of backends) {
            this.checkBackend(
                backend
            );
        }
    }

    checkBackend(backend) {
        const socket =
            new net.Socket();

        let finished = false;

        const timeout =
            setTimeout(() => {
                if (!finished) {
                    finished = true;

                    socket.destroy();

                    this.backendManager
                        .markUnhealthy(
                            backend.id
                        );
                }
            }, this.config.healthCheck
                .timeout);

        socket.connect(
            backend.port,
            backend.host,
            () => {
                if (finished) {
                    return;
                }

                finished = true;

                clearTimeout(timeout);

                socket.destroy();

                this.backendManager
                    .markHealthy(
                        backend.id
                    );
            }
        );

        socket.on(
            "error",
            () => {
                if (finished) {
                    return;
                }

                finished = true;

                clearTimeout(timeout);

                socket.destroy();

                this.backendManager
                    .markUnhealthy(
                        backend.id
                    );
            }
        );
    }

    stop() {
        if (this.timer) {
            clearInterval(
                this.timer
            );
        }
    }
}

module.exports = HealthChecker; 