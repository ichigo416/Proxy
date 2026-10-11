function parseHttpRequest(buffer) {
    const requestText =
        buffer.toString("utf-8");

    const headerEnd =
        requestText.indexOf("\r\n\r\n");

    if (headerEnd === -1) {
        return null;
    }

    const headerSection =
        requestText.substring(
            0,
            headerEnd
        );

    const lines =
        headerSection.split("\r\n");

    const requestLine = lines[0];

    const [
        method,
        path,
        version
    ] = requestLine.split(" ");

    const headers = {};

    for (let i = 1; i < lines.length; i++) {
        const separator =
            lines[i].indexOf(":");

        if (separator === -1) {
            continue;
        }

        const key =
            lines[i]
                .substring(0, separator)
                .trim()
                .toLowerCase();

        const value =
            lines[i]
                .substring(separator + 1)
                .trim();

        headers[key] = value;
    }

    return {
        method,
        path,
        version,
        headers,
        raw: buffer
    };
}

module.exports = {
    parseHttpRequest
}; 