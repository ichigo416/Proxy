const RoundRobin = require("./roundRobin");
const LeastConnections = require("./leastConnections");

function createLoadBalancer(
    algorithm,
    backendManager
) {
    switch (algorithm) {
        case "round-robin":
            return new RoundRobin(
                backendManager
            );

        case "least-connections":
            return new LeastConnections(
                backendManager
            );

        default:
            throw new Error(
                `Unsupported load balancing algorithm: ${algorithm}`
            );
    }
}

module.exports = {
    createLoadBalancer
};