const WebSocket = require('ws');
const global = require("./config/global")
const { checkPosition } = require("./control/tradeController")

var reconnectInterval = 1000

var getRealtimeData = function (symbols) {
    // try {
        const Symbols = symbols.map((index) => index.code)
        const syms = Symbols.join(",");
        console.log(syms);
        const ws = new WebSocket('wss://marketdata.tradermade.com/feedadv');

        ws.on('open', function open() {
            ws.send(`{"userKey":"sio3aaPYVIHFBnMMLnBww", "symbol":"${syms}"}`);;
        });

        ws.on('close', function () {
            console.log('socket close : will reconnect in ' + reconnectInterval);
            setTimeout(getRealtimeData, reconnectInterval)
        });

        ws.onmessage = (event) => {
            try {
                if (event.data === "User Key Used to many times") {
                    console.log("User Key Used to many times");
                    return;
                }
                if (event.data !== "Connected") {
                    const data = JSON.parse(event.data);
                    global.bids[Symbols.indexOf(data.symbol)] = data.bid;
                    global.asks[Symbols.indexOf(data.symbol)] = data.ask;
                    checkPosition();
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
    // } catch (error) {
    //     console.log(`Error | GetFetchData | ${error}`)
    // }

};

module.exports = getRealtimeData;
