const express = require("express");
const docsRoutes = express.Router();
const ObjectId = require("mongodb").ObjectId;
const docsModel = require("../models/docsModel");
const authModel = require("../models/authModel");

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

//Update doc
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

module.exports = docsRoutes;
