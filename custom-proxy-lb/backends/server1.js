const http = require("http");

const PORT = 9001;

const server =
    http.createServer(
        (req, res) => {
            console.log(
                `[SERVER-1] ${req.method} ${req.url}`
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
                    server: "server-1",
                    port: PORT,
                    message:
                        "Response from Backend Server 1",
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
            `Backend Server 1 running on ${PORT}`
        );
    }
); 