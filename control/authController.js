const bcrypt = require('bcrypt');
const { where } = require('sequelize');
const { User } = require("../models");
const jwt = require('jsonwebtoken');
const secretKey = 'tradeSecretKey';

exports.login = async (req, res) => {
    const { email, password, server } = req.body;
    console.log("this is a email, password, server", email, server, password)
    const user = await User.findOne({ where: { email: email} });
    if (user) {
        const result = await bcrypt.compare(password, user.password);
        if(result) {
            const payload = {password: password, server: server};
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
            await User.update({ token: token }, { where: { id: user.id} });
            console.log("this is a success")
            res.status(200).json({ state: true, token: token });
        }
        else res.status(200).json({ state: false, msg: "Invailid User" });
    } else {
        res.status(200).json({ state: false, msg: "Invailid User" });
    }
}