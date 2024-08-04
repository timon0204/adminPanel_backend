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
            pip_size: {
                type: Sequelize.DOUBLE(20, 6),
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
        // await Symbols.destroy({ truncate: true });
        // await Symbols.create({
        //     name: "EUR to USD",
        //     type: "FX:EURUSD",
        //     code: "EURUSD",
        //     pip_size: 0.0001,
        // });
        // await Symbols.create({
        //     name: "USD to JPY",
        //     type: "FX:USDJPY",
        //     code: "USDJPY",
        //     pip_size: 0.0001,
        // });
    }

    return Symbols;
}