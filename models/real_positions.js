const MD5 = require('md5.js');
const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize) => {
    const RealPosition = sequelize.define(
        "RealPosition",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            positionID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            userID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,                     ////////////////////
                allowNull: false,
                defaultValue: ""
            },
            size: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false,
                defaultValue: 0
            },
            symbol: {
                type: Sequelize.STRING,                     ////////////////////
                allowNull: false,
                defaultValue: ""
            },
            startPrice: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false,
                defaultValue: 1
            },
            stopPrice: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: true,
                defaultValue: 1
            },
            stopLoss: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: true,
                defaultValue: 0
            },
            takeProfit: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false,
                defaultValue: 0
            },
            commission: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false,
                defaultValue: 0
            },
            realProfit: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false,
                defaultValue: 0
            },
            closeReason: {
                type: Sequelize.ENUM("TakeProfit", "StopLoss", "UserClose"),
                allowNull: false
            }
        },
        {
            tableName: "real_positions",
            freezeTableName: true,
            timestamps: true,
        }
    );

    RealPosition.migrate = async () => {
        await RealPosition.destroy({ truncate: true });
    }

    return RealPosition;
}