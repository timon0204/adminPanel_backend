const { Positions, RealPositions, User, Symbols } = require("../models");
const global = require("../config/global");
const { where } = require("sequelize");
const symbols = require("../models/symbols");

// const Symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF']
// const leverage = 1, pip_size = 0.0001, commission = 0.03;               //////getUserInfo from data

exports.createPosition = async (req, res) => {
    console.log("data : ", req.body);
    const { amount, symbol, option } = req.body;

    const user = await User.findOne({ where: { token: req.headers.authorization } })
    const leverage = user.leverage;
    const commission = user.commission;
    const { balance, margin } = user;
    const symbolIndex = await Symbols.findOne({ where: { code: symbol } });
    const pip_size = symbolIndex.pip_size;
    const symbolID = symbolIndex.id;
    const updateMargin = (margin + amount / pip_size * (option ? global.bids[symbolID] : global.asks[symbolID])).toFixed(2);

    console.log(balance, ",", margin, ",", updateMargin);
    if (updateMargin + commission > balance) {
        res.status(200).json({ state: "Your balance is not enough" });
        return;
    }
    await Positions.create({
        userID: user.id,
        type: option ? "Sell" : "Buy",
        size: amount,
        status: 'Open',
        symbolID: symbolID,
        startPrice: option ? global.bids[symbolID] : global.asks[symbolID],
    });

    await User.update({ balance: balance, margin: updateMargin }, { where: { id: user.id } });
    const PositionList = await Positions.findAll();

    res.status(200).json({ positions: PositionList, leverage: leverage, balance: user.balance, margin: updateMargin });
};

exports.closePosition = async (req, res) => {
    console.log("cacelID : ", req.body);

    const { id } = req.body;
    const closePosition = await Positions.findOne({ where: { id: id, status: 'Open' } });
    const user = await User.findOne({ where: { token: req.headers.authorization } })
    const leverage = user.leverage;
    const commission = user.commission;
    const { balance, margin } = user;

    const updateMargin = margin - (closePosition.size / pip_size * closePosition.startPrice).toFixed(2);

    if (!closePosition) {
        res.status(400).json("Already Trade");
        return;
    }
    await Positions.destroy({
        where: {
            id: id
        }
    });
    const symbolIndex = await Symbols.findOne({ where: { id: closePosition.symbolID } });
    const pip_size = symbolIndex.pip_size;
    const stopPrice = closePosition.type == "Sell" ? global.bids[closePosition.symbolID] : global.asks[closePosition.symbolID];
    const profit = (closePosition.type == "Sell" ? -1 : 1) * (stopPrice - closePosition.startPrice) / pip_size * closePosition.size - commission;
    const updateBalance = balance + profit;

    await Positions.create({
        positionID: closePosition.id,
        userID: closePosition.userID,
        type: closePosition.type,
        size: closePosition.size,
        symbol: closePosition.symbol,
        startPrice: closePosition.startPrice,
        status: "Close",
        stopPrice: stopPrice,
        stopLoss: closePosition.stopLoss,
        takeProfit: closePosition.takeProfit,
        commission: commission,
        realProfit: profit,
        closeReason: "UserClose",
    });
    await User.update({ margin: updateMargin, balance: updateBalance }, { where: { id: user.id } });

    const PositionList = await Positions.findAll({ where: { status: 'Open' } });
    const RealPositionList = await Positions.findAll({ where: { status: 'Close' } });
    res.status(200).json({ positions: PositionList, leverage: leverage, realPositions: RealPositionList, margin: updateMargin, balance: balance });
};

exports.checkPosition = async () => {
    const PositionList = await Positions.findAll({ where: { status: 'Open' } });
    const symbolIndex = await Symbols.findOne({ where: { id: closePosition.symbolID } });
    const pip_size = symbolIndex.pip_size;
    for (const position of PositionList) {
        const stopPrice = position.type == "Sell" ? global.bids[position.symbolID] : global.asks[position.symbolID];
        const profit = (position.type == "Sell" ? -1 : 1) * (stopPrice - position.startPrice) / pip_size * position.size - commission;
        // console.log((stopPrice - position.startPrice) * symbolrate * position.size)
        // console.log(stopPrice, " profit : ", profit, "takeProfit : ", position.takeProfit, "stopLoss : ", position.stopLoss)
        if (profit > position.takeProfit && position.takeProfit != 0) {
            const user = await User.findOne({ where: { id: position.userID } })
            const { balance, margin } = user;
            const updateMargin = margin - (position.size / pip_size * position.startPrice).toFixed(2);
            const updateBalance = balance + profit;

            const destroyPosition = await Positions.destroy({ where: { id: position.id } });
            if (destroyPosition) {
                await Positions.create({
                    positionID: position.id,
                    userID: position.userID,
                    type: position.type,
                    size: position.size,
                    symbolID: position.symbolID,
                    startPrice: position.startPrice,
                    stopPrice: stopPrice,
                    stopLoss: position.stopLoss,
                    takeProfit: position.takeProfit,
                    commission: commission,
                    realProfit: profit,
                    closeReason: "TakeProfit",
                });
                await User.update({ margin: updateMargin, balance: updateBalance }, { where: { id: user.id } });
            }
        }
        if (-profit > position.stopLoss && position.stopLoss != 0) {
            const user = await User.findOne({ where: { id: position.userID } })
            const { balance, margin } = user;
            const updateMargin = margin - (position.size / pip_size * position.startPrice).toFixed(2);
            const updateBalance = balance + profit;

            const destroyPosition = await Positions.destroy({ where: { id: position.id } });
            if (destroyPosition) {
                await RealPositions.create({
                    positionID: position.id,
                    userID: position.userID,
                    type: position.type,
                    size: position.size,
                    symbolID: position.symbolID,
                    startPrice: position.startPrice,
                    stopPrice: stopPrice,
                    stopLoss: position.stopLoss,
                    takeProfit: position.takeProfit,
                    commission: position.commission,
                    realProfit: profit,
                    closeReason: "StopLoss",
                })
                await User.update({ margin: updateMargin, balance: updateBalance }, { where: { id: user.id } });
            }
        }
    }
};

exports.getAllPosition = async (req, res) => {
    const user = await User.findOne({ where: { token: req.headers.authorization } })
    const leverage = user.leverage;
    const PositionList = await Positions.findAll({ where: { status: "Open" } });
    const RealPositionList = await Positions.findAll({ where: { status: "Close" } });

    res.status(200).json({ positions: PositionList, leverage: leverage, realPositions: RealPositionList, margin: user.margin, balance: user.balance });
}

exports.updatePosition = async (req, res) => {
    const { updateID, updateProfit, updateLoss } = req.body

    await Positions.update({ takeProfit: Number(updateProfit), stopLoss: Number(updateLoss) }, { where: { id: updateID } })

    const PositionList = await Positions.findAll({ where: { status: "Open" } });

    res.status(200).json({ positions: PositionList});
}

exports.getSymbols = async (req, res) => {
    const symbols = await Symbols.findAll({ attributes: ['code', 'name', 'type', 'pip_size'] });
    return res.status(200).json(symbols);
}

exports.getTradingDatas = async (req, res) => {
    const user = await User.findOne({where: {token: req.headers.authorization}});
    console.log("this is the leverage and commition,", user.leverage, user.commission)
    return res.status(200).json({leverage: user.leverage, commission: user.commission});
}