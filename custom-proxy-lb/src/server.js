const {
    loadConfig
} = require("./config/config");

const BackendManager =
    require("./backends/backendManager");

const {
    createLoadBalancer
} = require("./loadBalancer");

const ProxyServer =
    require("./proxy/proxyServer");

const HealthChecker =
    require("./backends/healthChecker");

const MetricsCollector =
    require("./metrics/metricsCollector");

const {
    startMetricsServer
} = require("./metrics/metricsServer");

const logger =
    require("./logger/logger");


const config =
    loadConfig();


const backendManager =
    new BackendManager(config);


const loadBalancer =
    createLoadBalancer(
        config.loadBalancer.algorithm,
        backendManager
    );


const metricsCollector =
    new MetricsCollector(
        backendManager
    );


const proxyServer =
    new ProxyServer(
        config,
        loadBalancer,
        metricsCollector
    );


const healthChecker =
    new HealthChecker(
        backendManager,
        config
    );


startMetricsServer(
    config,
    metricsCollector
);


proxyServer.start();


healthChecker.start();


logger.info(
    "Custom proxy initialized",
    {
        algorithm:
            config.loadBalancer.algorithm
    }
);


process.on(
    "SIGINT",
    () => {

        logger.info(
            "Shutting down proxy..."
        );

        healthChecker.stop();

        process.exit(0);
    }
);


process.on(
    "SIGTERM",
    () => {

        logger.info(
            "Received SIGTERM"
        );

        healthChecker.stop();

        process.exit(0);
    }
);