const WebSocket = require('ws');
const global = require("./config/global")
const {checkPosition} = require("./control/tradeController")

var reconnectInterval = 1000
const Symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF']

var getRealtimeData = function () {

    const ws = new WebSocket('wss://marketdata.tradermade.com/feedadv');

    ws.on('open', function open() {
        ws.send('{"userKey":"wsx87-Jw_pCkochqfjRA", "symbol":"EURUSD,GBPUSD,USDJPY,AUDUSD,USDCAD,USDCHF"}');;
    });

    ws.on('close', function () {
        console.log('socket close : will reconnect in ' + reconnectInterval);
        setTimeout(getRealtimeData, reconnectInterval)
    });

    ws.onmessage = (event) => {
        try {
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
};

module.exports = getRealtimeData;
