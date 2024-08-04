const MD5 = require('md5.js');
const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userName: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: ""
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: ""
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: ""
            },
            token:{
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
            margin: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            server: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            allow: {
                type: Sequelize.ENUM("Allow", "Block"),
                allowNull: false,
            },
            totalProfit: {
                type: Sequelize.STRING,
                alllowNull: false,
            },
            commission: {
                type: Sequelize.DOUBLE(20, 6),
                allowNull: false
            },
            role : {
                type: Sequelize.STRING,
                alllowNull: false
            }
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
                email: "admin@gmail.com",
                userName: "Admin",
                password: hashedPassword,
                server: 'trading',
                leverage: 1,                                  /////////////////////////
                allow: "Allow",
                role: "admin",
                commission: 0.03,
            })
        // }
    };

    return User;
}