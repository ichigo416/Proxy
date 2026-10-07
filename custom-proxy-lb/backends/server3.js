const http = require("http");

const PORT = 9003;

const server =
    http.createServer(
        (req, res) => {
            console.log(
                `[SERVER-3] ${req.method} ${req.url}`
            );

            res.writeHead(
                200,
                {
                    "Content-Type":
                        "application/json"
                }
            );

            res.end(
                JSON.stringify({
                    server: "server-3",
                    port: PORT,
                    message:
                        "Response from Backend Server 3",
                    timestamp:
                        new Date().toISOString()
                })
            );
        }
    );

server.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `Backend Server 3 running on ${PORT}`
        );
    }
); 