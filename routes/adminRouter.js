const express = require('express');
const router = express.Router();
const { authmiddleware } = require('../middleware/authmiddleware');
const adminControl = require('../control/adminController');

router.post("/login",adminControl.login);
router.get("/getUsers", authmiddleware, adminControl.getUsers);
router.post("/createUser", authmiddleware, adminControl.createUser);
router.post("/updateUser", authmiddleware, adminControl.updateUser);
router.post("/deleteUser", authmiddleware, adminControl.deleteUser);
router.get("/getSymbols", authmiddleware, adminControl.getSymbols);
router.post("/updateSymbol", authmiddleware, adminControl.editSymbol);
router.post("/createSymbol", authmiddleware, adminControl.createSymbol);
router.post("/deleteSymbol", authmiddleware, adminControl.deleteSymbol)
router.get("/getPositions", authmiddleware, adminControl.getPositions);

module.exports = router;
