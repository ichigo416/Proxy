const http = require("http");

const PORT = 9002;

const server =
    http.createServer(
        (req, res) => {
            console.log(
                `[SERVER-2] ${req.method} ${req.url}`
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
                    server: "server-2",
                    port: PORT,
                    message:
                        "Response from Backend Server 2",
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
            `Backend Server 2 running on ${PORT}`
        );
    }
); 