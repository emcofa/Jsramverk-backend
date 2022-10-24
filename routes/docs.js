const express = require("express");
const docsRoutes = express.Router();
const ObjectId = require("mongodb").ObjectId;
const docsModel = require("../models/docsModel");
const authModel = require("../models/authModel");

const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
// const { SENDGRID_API } = require('../config/keys');

const SENDGRID_API = process.env.SENDGRID_API_KEY;

//Get all docs
docsRoutes.get(
    "/",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => {
        const docs = await docsModel.getAllDocs();

        return res.status(200).json({
            data: docs
        });
    }
);

//Insert new doc
docsRoutes.post(
    "/",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => {
        const result = await docsModel.insertDoc(req.body);

        return res.status(201).json({ data: result });
    }
);

//Get single doc
docsRoutes.get(
    "/docs/:id",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => {
        let myquery = { _id: ObjectId(req.params.id) };
        const docs = await docsModel.getById(myquery);

        return res.status(200).json({
            data: docs
        });
    }
);

//Update doc
docsRoutes.put(
    "/update/:id",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => {
        let myquery = { _id: ObjectId(req.params.id) };
        // console.log("req", req)
        const docs = await docsModel.update(myquery, req.body);

        return res.status(200).json({
            data: docs
        });
    });

//Give user access
docsRoutes.put(
    "/access/:id",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => {
        let myquery = { _id: ObjectId(req.params.id) };
        const docs = await docsModel.giveAccess(myquery, req.body);

        return res.status(200).json({
            data: docs
        });
    });

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: SENDGRID_API
    }
})
);

docsRoutes.post("/send", (req, res) => {
    const { usersName, email, access, doc, text } = req.body;

    transporter.sendMail({
        to: access,
        from: "emmie.fahlstrom@outlook.com",
        subject: "Invitation to edit document",
        html: `<h3>${usersName}</h3><p>You've got and invitation to edit document: "${doc}"
            <p>Visit:</p>
            <a href=${text}>${text}</a>
            <p>to register and start editing.</p>
            <p>Regards,</p>
            <p>${email}</p>`
    }).then(response => {
        res.json({ response });
    }).catch(err => {
        console.log(err);
    });
});

module.exports = docsRoutes;
