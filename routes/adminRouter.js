const express = require('express');
const router = express.Router();
const { authmiddleware } = require('../middleware/authmiddleware');
const adminControl = require('../control/adminController');

router.post("/login",adminControl.login);
router.get("/accounts", authmiddleware, adminControl.getAccounts);

module.exports = router;
