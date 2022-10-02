const express = require('express');
const authRoutes = express.Router();
const authModel = require('./../models/authModel');


authRoutes.post("/register", async (req, res) => {
    const body = req.body;

    await authModel.register(res, body);
});

authRoutes.post("/login", async (req, res) => {
    const body = req.body;

    await authModel.login(res, body);
});

module.exports = authRoutes;
