const MD5 = require('md5.js');
const bcrypt = require('bcrypt');
const company = require('./company');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        "User",
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
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            companyEmail: {
                type: Sequelize.STRING,
                alllowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            token: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            leverage: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false,
                defaultValue: 1
            },
            balance: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 10000
            },
            usedMargin: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            allow: {
                type: Sequelize.ENUM("Allow", "Block"),
                allowNull: false,
            },
            totalProfit: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: "users",
            freezeTableName: true,
            timestamps: true,
        }
    );

    User.migrate = async () => {
        // const count = await User.count();

        // if (!count) {
            await User.destroy({ truncate: true });
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash("123456", saltRounds);

            await User.create({
                email: "test@gmail.com",
                name: "Admin",
                companyEmail: "admin@gmail.com",
                password: hashedPassword,
                allow: "Allow",
            })
        // }
    };

    return User;
}