const { User } = require("../models");

exports.authmiddleware = async (req, res, next) => {
    const token = req.headers.authorization || "";
    if (token == "") {
        res.status(200).json({ state: "No Vailed Token! Please Login Again!" });
        return
    }
    const user = await User.findOne({ where: { token } });
    if (!user) {
        res.status(200).json({ state: "No Vailed Token! Please Login Again!" });
        return
    }
    next();
}
