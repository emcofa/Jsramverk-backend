const express = require("express");
const docsRoutes = express.Router();
const ObjectId = require("mongodb").ObjectId;
const docsModel = require("../models/docsModel");


docsRoutes.get(
  "/",
  async (req, res) => {
    const docs = await docsModel.getAllDocs();

    return res.json({
      data: docs
    });
  }
);

docsRoutes.post(
  "/",
  async (req, res) => {
    const newDoc = req.body;

    const result = await docsModel.insertDoc(newDoc);

    return res.status(201).json({ data: result });
  }
);


docsRoutes.post(
  "/init",
  async (req, res) => {
    await docsModel.init();

    res.send("inserted docs");
  }
);

docsRoutes.get(
  "/docs/:id",
  async (req, res) => {
    let myquery = { _id: ObjectId(req.params.id) };
    const docs = await docsModel.getById(myquery);

    return res.json({
      data: docs
    });
  }
);

docsRoutes.put(
  "/update/:id",
  async (req, res) => {
    let myquery = { _id: ObjectId(req.params.id) };

    let newvalues = {
      $set: {
        name: req.body.name,
        html: req.body.html
      },
    };

    const docs = await docsModel.update(myquery, newvalues);
    return res.json({
      data: docs
    });
  });

docsRoutes.delete(
  "/:id",
  async (req, res) => {
    let myquery = { _id: ObjectId(req.params.id) };

    const docs = await docsModel.delete(myquery);
    return res.json({
      data: docs
    });
  });

module.exports = docsRoutes;