const MD5 = require('md5.js');
const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize) => {
    const Positions = sequelize.define(
        "Positions",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM("Sell", "Buy"),                     
                allowNull: false,
            },
            size: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false,
                defaultValue: 0
            },
            symbolID: {
                type: Sequelize.ENUM("EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF"),                     
                allowNull: false,
            },
            startPrice: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false,
                defaultValue: 1
            },
            stopLoss: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: true,
                defaultValue: 0
            },
            takeProfit: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: true,
                defaultValue: 0
            },
            stopPrice: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: true
            },
            stopLoss: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: true,
            },
            commission: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false,
            },
            realProfit: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM("Open", "Close"),
                allowNull: false,
            },
            closeReason: {
                type: Sequelize.ENUM("TakeProfit", "StopLoss", "UserClose", "None"),
                allowNull: true
            }
        },
        {
            tableName: "positions",
            freezeTableName: true,
            timestamps: true,
        }
    );

    Positions.migrate = async () => {
        await Positions.destroy({ truncate: true });
    }

    return Positions;
}