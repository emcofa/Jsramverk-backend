/* global it describe before */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

chai.should();
chai.use(chaiHttp);

const database = require("../db/conn.js");
const collectionName = "docs";


describe('DOCS database', () => {
    before(() => {
        return new Promise(async (resolve) => {
            const db = await database.getDb();

            db.db.listCollections(
                { name: collectionName }
            )
                .next()
                .then(async function (info) {
                    if (info) {
                        await db.collection.drop();
                    }
                })
                .catch(function (err) {
                    console.error(err);
                })
                .finally(async function () {
                    await db.client.close();
                    resolve();
                });
        });
    });

    describe('GET /docs', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/docs")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");

                    done();
                });
        });
    });

    describe('POST /docs/init', () => {
        it('201 Init docs', (done) => {
            chai.request(server)
                .post("/docs/init")
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");

                    done();
                });
        });
    });


    describe('POST /docs', () => {
        let newId;

        it('201 Insert, update and get single doc by ID ', (done) => {
            let doc = {
                name: "Test Doc",
                html: "Testing testing"
            };

            chai.request(server)
                .post("/docs")
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.data._id.should.be.a('string');
                    newId = res.body.data._id;

                    done();
                });
        });

        it('Update doc', (done) => {
            chai.request(server)
                .put(`/docs/update/${newId}`)
                .send({
                    _id: newId,
                    name: "Test Doc",
                    html: "Testing testing"
                })
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });
        it('Get single doc', (done) => {
            chai.request(server)
                .get(`/docs/docs/${newId}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");

                    done();
                });
        });
    });
});
