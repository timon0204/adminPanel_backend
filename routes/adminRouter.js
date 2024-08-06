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
router.post("/updateSymbol", authmiddleware, adminControl.updateSymbol);
router.post("/createSymbol", authmiddleware, adminControl.createSymbol);
router.post("/deleteSymbol", authmiddleware, adminControl.deleteSymbol)
router.get("/getAssets", authmiddleware, adminControl.getAssets);
router.post("/updateAsset", authmiddleware, adminControl.updateAsset);
router.post("/createAsset", authmiddleware, adminControl.createAsset);
router.post("/deleteAsset", authmiddleware, adminControl.deleteAsset);
router.get("/getCompanies", authmiddleware, adminControl.getCompanies);
router.post("/createCompany", authmiddleware, adminControl.createCompany);
router.post("/updateCompany", authmiddleware, adminControl.updateCompany);
router.post("/deleteCompany", authmiddleware, adminControl.deleteCompany);
router.get("/getPositions", authmiddleware, adminControl.getPositions);

module.exports = router;
