const MD5 = require('md5.js');
const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize) => {
    const Assets = sequelize.define(
        "Assets",
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
            pip_size: {
                type: Sequelize.DOUBLE(20,6),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM("Open", "Closed"),
                allowNull: false,
            },
        },
        {
            tableName: "assets",
            freezeTableName: true,
            timestamps: true,
        }
    );

    Assets.migrate = async () => {
        await Assets.destroy({ truncate: true });
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

    return Assets;
}