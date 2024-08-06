const MD5 = require('md5.js');
const bcrypt = require('bcrypt');
const { Company } = require('.');

module.exports = (sequelize, Sequelize) => {
    const Commission = sequelize.define(
        "Commission",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            companyEmail: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            Major: {
                type: Sequelize.DOUBLE(20,6),
                allowNull: false,
            },
            JPYpairs: {
                type: Sequelize.DOUBLE(20,6),
                allowNull: false,
            },
            Indices: {
                type: Sequelize.DOUBLE(20,6),
                allowNull: false,
            },
            Metal: {
                type: Sequelize.DOUBLE(20,6),
                allowNull: false,
            },
            Oil: {
                type: Sequelize.DOUBLE(20,6),
                allowNull: false,
            },
            BTCUSD: {
                type: Sequelize.DOUBLE(20,6),
                allowNull: false,
            },
        },
        {
            tableName: "commission",
            freezeTableName: true,
            timestamps: true,
        }
    );

    Commission.migrate = async () => {
        // await Commission.destroy({ truncate: true });
    }

    return Commission;
}