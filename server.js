const http = require("http");

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.url.startsWith("/cmp")) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const symbol = url.searchParams.get("symbol");

        if (!symbol) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Symbol required" }));
            return;
        }

        try {
            const yahooSymbol = `${symbol}.NS`;

            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1d&interval=1d`
            );

            if (!response.ok) {
                throw new Error(`Yahoo HTTP ${response.status}`);
            }

            const data = await response.json();

            const cmp =
                data?.chart?.result?.[0]?.meta?.regularMarketPrice;

            if (typeof cmp !== "number") {
                throw new Error("CMP not available");
            }

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                symbol,
                cmp
            }));

        } catch (error) {

            console.error("CMP ERROR:", error);

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                error: "Unable to fetch CMP"
            }));
        }

        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(PORT, () => {
    console.log(`CMP SERVER RUNNING: http://localhost:${PORT}`);
});