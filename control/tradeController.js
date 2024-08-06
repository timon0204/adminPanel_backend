const { Positions, RealPositions, User, Symbols, Assets, Commission } = require("../models");
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
    const { balance, usedMargin } = user;
    const symbolIndex = await Symbols.findOne({ where: { code: symbol } });

    const asset = await Assets.findOne({ where: { name: symbolIndex.assetName } });
    const commissions = await Commission.findOne({ where: { companyEmail: user.companyEmail } });
    const commission = commissions[`${symbolIndex.assetName}`];
    console.log(symbolIndex.assetName, commission);
    const pip_size = asset.pip_size;
    const symbolID = symbolIndex.id;
    const updateMargin = (usedMargin + amount / pip_size * (option ? global.bids[global.symbols.indexOf(symbol)] : global.asks[global.symbols.indexOf(symbol)]) * leverage).toFixed(2);
    console.log(usedMargin, amount, pip_size, (option ? global.bids[global.symbols.indexOf(symbol)] : global.asks[global.symbols.indexOf(symbol)]));
    console.log(updateMargin + commission, ",", balance, ",", Number(updateMargin) + Number(commission) > Number(balance));
    if (Number(updateMargin) + Number(commission) > balance) {
        console.log('here');
        res.status(200).json({ state: "Your balance is not enough" });
        return;
    }
    await Positions.create({
        userID: user.id,
        type: option ? "Sell" : "Buy",
        size: amount,
        status: 'Open',
        symbolName: symbol,
        commission: commission,
        startPrice: option ? global.bids[global.symbols.indexOf(symbol)] : global.asks[global.symbols.indexOf(symbol)],
    });

    await User.update({ balance: balance, usedMargin: updateMargin }, { where: { id: user.id } });
    const PositionList = await Positions.findAll();

    res.status(200).json({ positions: PositionList, leverage: leverage, balance: user.balance, margin: updateMargin });
};

exports.closePosition = async (req, res) => {
    console.log("cacelID : ", req.body);

    const { id } = req.body;
    const closePosition = await Positions.findOne({ where: { id: id, status: 'Open' } });
    const user = await User.findOne({ where: { token: req.headers.authorization } })
    const leverage = user.leverage;
    const { balance, usedMargin } = user;

    if (!closePosition) {
        res.status(400).json("Already Trade");
        return;
    }
    await Positions.destroy({
        where: {
            id: id
        }
    });
    const symbolIndex = await Symbols.findOne({ where: { code: closePosition.symbolName } });
    const asset = await Assets.findOne({ where: { name: symbolIndex.assetName } });
    const pip_size = asset.pip_size;
    const updateMargin = usedMargin - (closePosition.size / pip_size * closePosition.startPrice) * leverage.toFixed(2);
    const stopPrice = closePosition.type == "Sell" ? global.bids[global.symbols.indexOf(closePosition.symbolName)] : global.asks[global.symbols.indexOf(closePosition.symbolName)];
    const profit = (closePosition.type == "Sell" ? -1 : 1) * (stopPrice - closePosition.startPrice) / pip_size * closePosition.size * leverage - closePosition.commission;
    const updateBalance = balance + profit;

    await Positions.create({
        positionID: closePosition.id,
        userID: closePosition.userID,
        type: closePosition.type,
        size: closePosition.size,
        symbolName: closePosition.symbolName,
        startPrice: closePosition.startPrice,
        status: "Close",
        stopPrice: stopPrice,
        stopLoss: closePosition.stopLoss,
        takeProfit: closePosition.takeProfit,
        commission: closePosition.commission,
        realProfit: profit,
        closeReason: "UserClose",
    });
    await User.update({ usedMargin: updateMargin, balance: updateBalance }, { where: { id: user.id } });

    const PositionList = await Positions.findAll({ where: { status: 'Open' } });
    const RealPositionList = await Positions.findAll({ where: { status: 'Close' } });
    res.status(200).json({ positions: PositionList, leverage: leverage, realPositions: RealPositionList, margin: updateMargin, balance: balance });
};

exports.checkPosition = async () => {
    const PositionList = await Positions.findAll({ where: { status: 'Open' } });

    for (const position of PositionList) {
        const symbolIndex = await Symbols.findOne({ where: { code: position.symbolName } });
        const asset = await Assets.findOne({ where: { name: symbolIndex.assetName } });
        const user = await User.findOne({ where: { id: position.userID } })
        const pip_size = asset.pip_size;
        const stopPrice = position.type == "Sell" ? global.bids[global.symbols.indexOf(position.symbolName)] : global.asks[global.symbols.indexOf(position.symbolName)];
        const profit = (position.type == "Sell" ? -1 : 1) * (stopPrice - position.startPrice) / pip_size * position.size * user.leverage - position.commission;
        // console.log((stopPrice - position.startPrice) * symbolrate * position.size)
        // console.log(stopPrice, " profit : ", profit, "takeProfit : ", position.takeProfit, "stopLoss : ", position.stopLoss)
        if (profit > position.takeProfit && position.takeProfit > 0) {
            const user = await User.findOne({ where: { id: position.userID } })
            const { balance, usedMargin } = user;
            const updateMargin = usedMargin - (position.size / pip_size * position.startPrice * user.leverage).toFixed(2);
            const updateBalance = balance + profit;

            const destroyPosition = await Positions.destroy({ where: { id: position.id } });
            if (destroyPosition) {
                await Positions.create({
                    positionID: position.id,
                    userID: position.userID,
                    type: position.type,
                    size: position.size,
                    symbolName: position.symbolName,
                    startPrice: position.startPrice,
                    stopPrice: stopPrice,
                    stopLoss: position.stopLoss,
                    takeProfit: position.takeProfit,
                    commission: position.commission,
                    realProfit: profit,
                    closeReason: "TakeProfit",
                });
                await User.update({ usedMargin: updateMargin, balance: updateBalance }, { where: { id: user.id } });
            }
        }
        if (-profit > position.stopLoss && position.stopLoss > 0) {
            const user = await User.findOne({ where: { id: position.userID } })
            const { balance, usedMargin } = user;
            const updateMargin = usedMargin - (position.size / pip_size * position.startPrice * user.leverage).toFixed(2);
            const updateBalance = balance + profit;

            const destroyPosition = await Positions.destroy({ where: { id: position.id } });
            if (destroyPosition) {
                await RealPositions.create({
                    positionID: position.id,
                    userID: position.userID,
                    type: position.type,
                    size: position.size,
                    symbolName: position.symbolName,
                    startPrice: position.startPrice,
                    stopPrice: stopPrice,
                    stopLoss: position.stopLoss,
                    takeProfit: position.takeProfit,
                    commission: position.commission,
                    realProfit: profit,
                    closeReason: "StopLoss",
                })
                await User.update({ usedMargin: updateMargin, balance: updateBalance }, { where: { id: user.id } });
            }
        }
    }
};

exports.getAllPosition = async (req, res) => {
    const user = await User.findOne({ where: { token: req.headers.authorization } })
    const leverage = user.leverage;
    const PositionList = await Positions.findAll({ where: { status: "Open" } });
    const RealPositionList = await Positions.findAll({ where: { status: "Close" } });

    res.status(200).json({ positions: PositionList, leverage: leverage, realPositions: RealPositionList, margin: user.usedMargin, balance: user.balance });
}

exports.updatePosition = async (req, res) => {
    const { updateID, updateProfit, updateLoss } = req.body

    await Positions.update({ takeProfit: Number(updateProfit), stopLoss: Number(updateLoss) }, { where: { id: updateID } })

    const PositionList = await Positions.findAll({ where: { status: "Open" } });

    res.status(200).json({ positions: PositionList });
}

exports.getSymbols = async (req, res) => {
    try {
        const symbols = await Symbols.findAll({ attributes: ['code', 'name', 'type', 'assetName'] });

        // Use map to create an array of promises
        const new_symbols = await Promise.all(symbols.map(async (symbol) => {
            const asset = await Assets.findOne({ where: { name: symbol.assetName } });
            return {
                code: symbol.code,
                name: symbol.name,
                type: symbol.type,
                assetName: symbol.assetName,
                pip_size: asset ? asset.pip_size : null // Handle the case where the asset is not found
            };
        }));

        return res.status(200).json(new_symbols);
    } catch (error) {
        console.error('Error fetching symbols with pip_size:', error);
        return res.status(500).json({ error: 'An error occurred while fetching symbols.' });
    }
}


exports.getTradingDatas = async (req, res) => {
    const user = await User.findOne({ where: { token: req.headers.authorization } });
    const commissions = await Commission.findOne({ where: { companyEmail: user.companyEmail } });
    console.log("this is the leverage and commition,", user.leverage)
    return res.status(200).json({ leverage: user.leverage, commissions: commissions });
}