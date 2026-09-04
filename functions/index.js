const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");

setGlobalOptions({ maxInstances: 10 });

exports.getShareCMP = onRequest(
    {
        cors: true
    },
    async (req, res) => {

        const symbol = req.query.symbol;

        if (!symbol) {
            return res.status(400).json({
                error: "NSE symbol is required"
            });
        }

        const yahooSymbol = `${symbol}.NS`;

        try {

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

            return res.json({
                symbol,
                cmp
            });

        } catch (error) {

            console.error("CMP FETCH ERROR:", error);

            return res.status(500).json({
                error: "Unable to fetch CMP"
            });
        }
    }
);