const MD5 = require('md5.js');
const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize) => {
    const Symbols = sequelize.define(
        "Symbols",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            assetName: {
                type: Sequelize.ENUM("Major", "JPYpairs", "Indices", "Metal", "Oil", "BTCUSD"),
                allowNull: false,
            },
        },
        {
            tableName: "symbol",
            freezeTableName: true,
            timestamps: true,
        }
    );

    Symbols.migrate = async () => {
        await Symbols.destroy({ truncate: true });
        await Symbols.create({
            name: "EUR to USD",
            type: "FX:EURUSD",
            code: "EURUSD",
            assetName: "Major",
        });
    }

    return Symbols;
}