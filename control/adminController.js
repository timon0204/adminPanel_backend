const bcrypt = require('bcrypt');
const { where } = require('sequelize');
const { User, Positions, Symbols, Assets } = require("../models");
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const symbols = require('../models/symbols');
const secretKey = 'tradeSecretKey';

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email: email } });
        if (user) {
            if (user.role != "admin") {
                return res.status(401).json({ state: false, message: "Invaild User" });
            }
            const result = await bcrypt.compare(password, user.password);
            if (result) {
                const payload = { userName: user.userName, password: user.password };
                const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
                await User.update({ token: token }, { where: { id: user.id } });
                return res.status(200).json({ state: true, token: token });
            } else {
                return res.status(401).json({ state: false, message: "Invalid User" });
            }
        } else {
            return res.status(401).json({ state: false, message: "Invalid User" });
        }
    } catch (error) {
        return res.status(500).json({ state: false, message: "An error occurred during authentication." });
    }
}

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({where : {role : "user"}});
        return res.status(200).send({ users: users });
    } catch (error) {
        return res.status(500).send({ message: "An error occurred while fetching users." });
    }
}

exports.createUser = async (req, res) => {
    try {
        const { userName, email, leverage, balance, margin, server, commission } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash("123456", saltRounds);
        const createdAt = Date.now();
        const user = await User.create({ userName: userName, email: email, password: hashedPassword, balance: balance, leverage: leverage, margin: margin, server: server, commission: commission, allow: "Allow", role: "user", createdAt: createdAt });
        user.save();
        return res.status(200).send({ message: "created successfully", newOne: user });
    } catch (err) {
        return res.status(500).send({ message: "An error occurred while creating user" });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { userId, userName, email, password, leverage, balance, server, allow, commission } = req.body;
        const saltRounds = 10;
        let hashedPassword = '';
        if (password.length) {
            hashedPassword = await bcrypt.hash(password, saltRounds);
        } else {
            hashedPassword = await bcrypt.hash("123456", saltRounds);
        }
        const updatedAt = Date.now();
        const user = await User.update({ userName: userName, email: email, password: hashedPassword, leverage: leverage, balance: balance, server: server, allow: allow, commission: commission, updatedAt: updatedAt }, { where: { id: userId } });
        return res.status(200).send({ message: "Updating successfully", updatedOne: user });
    } catch (err) {
        return res.status(500).send({ message: "An error occured while updating user" });
    }
}

exports.deleteUser = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).send({ message: 'Cannot find the user' });
        }
        await User.destroy({ where: { id: userId } });
        return res.status(200).send({ message: "Successfully deleted" });
    } catch (error) {
        return res.status(500).send({ message: 'An error occurred while deleting the user.' });
    }
}

exports.getSymbols = async (req, res) => {
    try {
        const symbols = await Symbols.findAll();
        const assets = await Assets.findAll({attributes: ['name']});
        const assetNames = assets.map(item => item.name);
        return res.status(200).send({ symbols: symbols, assetNames: assetNames });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'An error occurred while fetching symbols' });
    }
}

exports.updateSymbol = async (req, res) => {
    try {
        const { name, type, code, assetName, symbolId } = req.body;
        const updatedAt = Date.now();
        const symbol = await Symbols.update({ name: name, type: type, code: code, assetName: assetName, updatedAt: updatedAt }, { where: { id: symbolId } });
        return res.status(200).send({ message: "Edit symbol successfully" });
    } catch (err) {
        return res.status(500).send({ message: "An error occured while editing symbol" });
    }
}

exports.createSymbol = async (req, res) => {
    try {
        const { name, type, code, assetName } = req.body;
        const createdAt = Date.now();
        const symbol = await Symbols.create({ name: name, type: type, code: code, assetName: assetName, createdAt: createdAt });
        symbol.save();
        return res.status(200).send({ message: 'Create symbol successfully' })
    } catch (err) {
        return res.status(500).send({ message: 'An error occured while creating symbol' })
    }
}

exports.deleteSymbol = async (req, res) => {
    try {
        const { symbolId } = req.body;
        const symbol = await Symbols.findOne({ where: { id: symbolId } });
        if (!symbol) {
            return res.status(404).send({ message: 'Cannot find the user' });
        }
        await Symbols.destroy({ where: { id: symbolId } });
        return res.status(200).send({ message: "Successfully deleted" });
    } catch (err) {
        return res.status(500).send({ message: "An error occurred while deleting symbol" });
    }
}

exports.getAssets = async (req, res) => {
    try {
        const assets = await Assets.findAll();
        return res.status(200).send({ assets: assets });
    } catch (err) {
        return res.status(500).send({ message: 'An error occurred while fetching Assets' });
    }
}

exports.updateAsset = async (req, res) => {
    try {
        const { name, pip_size, status, assetId } = req.body;
        const updatedAt = Date.now();
        await Assets.update({ name: name, pip_size: pip_size, status: status, updatedAt: updatedAt }, { where: { id: assetId } });
        return res.status(200).send({ message: "Edit symbol successfully" });
    } catch (err) {
        return res.status(500).send({ message: "An error occured while editing Assets" });
    }
}

exports.createAsset = async (req, res) => {
    try {
        const { name, pip_size, status } = req.body;
        const createdAt = Date.now();
        const asset = await Assets.create({ name: name, pip_size: pip_size, status: status, createdAt: createdAt });
        // asset.save();
        return res.status(200).send({ message: 'Create symbol successfully' })
    } catch (err) {
        return res.status(500).send({ message: 'An error occured while creating Assets',err })
    }
}

exports.deleteAsset = async (req, res) => {
    try {
        const { assetId } = req.body;
        const asset = await Assets.findOne({ where: { id: assetId } });
        if (!asset) {
            return res.status(404).send({ message: 'Cannot find the user' });
        }
        await Assets.destroy({ where: { id: assetId } });
        return res.status(200).send({ message: "Successfully deleted" });
    } catch (err) {
        return res.status(500).send({ message: "An error occurred while deleting symbol" });
    }
}

exports.getPositions = async (req, res) => {
    try {
        const positions = await Positions.findAll();
        return res.status(200).send({ positions: positions });
    } catch (err) {
        return res.status(200).send({ message: "An error occurred while fetching postions" });
    }
}