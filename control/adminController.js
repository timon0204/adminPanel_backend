const bcrypt = require('bcrypt');
const { where } = require('sequelize');
const { User } = require("../models");
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const secretKey = 'tradeSecretKey';

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("this is a req", req.body)
    const user = await User.findOne({ where: { email: email} });
    if (user) {
        const result = await bcrypt.compare(password, user.password);
        if(result) {
            const payload = {userName:user.userName, password:user.password};
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
            await User.update({ token: token }, { where: { id: user.id} });
            console.log("this is a success")
            res.status(200).json({ state: true, token: token });
        }
        else res.status(401).json({ state: false, message: "Invailid User" });
    } else {
        res.status(200).json({ state: false, message: "Invailid User" });
    }
}

exports.getAccounts = async (req, res) => { 
    const users = await User.findAll();
    return res.status(200).send({users : users});
}