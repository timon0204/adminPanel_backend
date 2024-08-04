const express = require('express');
const router = express.Router();
const tradeControl = require("../control/tradeController")
const authControl = require("../control/authController");
const { authmiddleware } = require('../middleware/authmiddleware');

router.get("/", (req, res) => {
    //////  Set Middleware  /////
    return res.render("index.html");
})
const app = express();

router.post("/login", authControl.login);

router.post("/createPosition", authmiddleware, tradeControl.createPosition);
router.post("/cancelPosition", authmiddleware, tradeControl.closePosition);
router.post("/getAllPositions", authmiddleware, tradeControl.getAllPosition);
router.post("/updatePosition", authmiddleware, tradeControl.updatePosition);

module.exports = router;