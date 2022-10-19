/* global it describe before */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

chai.should();
chai.use(chaiHttp);

const database = require("../db/conn.js");
const collectionName = "docs";

chai.use(chaiHttp);

describe('Test the routes.', () => {
    let token;

    describe('DOCS database', () => {
        before(() => {
            return async () => {
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
                    });
            };
        });

        describe('POST /register', () => {
            it('Register with random correct email', (done) => {
                const random = (length = 8) => {
                    return Math.random().toString(16).substr(2, length);
                };

                let user = {
                    email: `${random(14)}@email.com`,
                    password: "RandomEmailToNotCreateMultipleUsers"
                };

                chai.request(server)
                    .post("/register")
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.data.message.should.equal("User successfully created.");
                        done();
                    });
            });

            it('Register already existed email', async () => {
                let user = {
                    email: "harry@potter.com",
                    password: "Hedwig"
                };

                chai.request(server)
                    .post("/register")
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.errors.message.should.equal("E-mail already exists");
                    });
            });

            it('Register email incorrect format', async () => {
                let user = {
                    email: "harrypotter.com",
                    password: "Hedwig"
                };

                chai.request(server)
                    .post("/register")
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.errors.message.should.equal("E-mail is not in correct format");
                    });
            });

            it('Register without password', async () => {
                let user = {
                    email: "harry@potter.com",
                    password: ""
                };

                chai.request(server)
                    .post("/register")
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.errors.message.should.equal("E-mail or password is missing");
                    });
            });
        });

        describe('POST /login', () => {
            it('Login user', async () => {
                let user = {
                    email: "harry@potter.com",
                    password: "Hedwig"
                };

                let res = await chai.request(server)
                    .post("/login")
                    .send(user);

                res.should.have.status(201);
                res.body.data.token.should.not.equal(null);

                token = res.body.data.token;
            });

            it('Login user without password', async () => {
                let user = {
                    email: "harry@potter.com",
                    password: ""
                };

                let res = await chai.request(server)
                    .post("/login")
                    .send(user);

                res.should.have.status(400);
                res.body.errors.message.should.equal("E-mail or password is missing");
            });

            it('Login non existing user', async () => {
                let user = {
                    email: "ron@weasley.com",
                    password: "Scabbers"
                };

                let res = await chai.request(server)
                    .post("/login")
                    .send(user);

                res.should.have.status(401);
                res.body.data.message.should.equal("User does not exist.");
            });

            it('Login user with wrong password', async () => {
                let user = {
                    email: "harry@potter.com",
                    password: "Hedwwig"
                };

                let res = await chai.request(server)
                    .post("/login")
                    .send(user);

                res.should.have.status(401);
                res.body.errors.message.should.equal("Password not correct");
            });
        });

        describe('GET /docs', () => {
            it('200 HAPPY PATH', (done) => {
                chai.request(server)
                    .get("/docs")
                    .set('x-access-token', token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an("object");
                        res.body.data.should.be.an("array");

                        done();
                    });
            });
            it('500 SAD PATH', (done) => {
                chai.request(server)
                    .get("/docs")
                    // .set('x-access-token', token)
                    .end((err, res) => {
                        res.should.have.status(500);
                        done();
                    });
            });
        });

        describe('POST & PUT /docs', () => {
            let newId;

            it('201 Insert, update and get single doc by ID ', (done) => {
                let doc = {
                    name: "Test Doc",
                    html: "Testing testing"
                };

                chai.request(server)
                    .post("/docs")
                    .set('x-access-token', token)
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
                    .set('x-access-token', token)
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
            it('Update doc error (without token)', (done) => {
                chai.request(server)
                    .put(`/docs/update/${newId}`)
                    .send({
                        _id: newId,
                        name: "Test Doc",
                        html: "Testing testing"
                    })
                    .end((err, res) => {
                        res.should.have.status(500);

                        done();
                    });
            });
            it('Get single doc', (done) => {
                chai.request(server)
                    .get(`/docs/docs/${newId}`)
                    .set('x-access-token', token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an("object");

                        done();
                    });
            });
            it('Get single doc error (without token)', (done) => {
                chai.request(server)
                    .get(`/docs/docs/${newId}`)
                    .end((err, res) => {
                        res.should.have.status(500);

                        done();
                    });
            });
            it('Give access', (done) => {
                chai.request(server)
                    .put(`/docs/access/${newId}`)
                    .set('x-access-token', token)
                    .send({
                        _id: newId,
                        allowed_users: "hermione@granger.com"
                    })
                    .end((err, res) => {
                        res.should.have.status(200);

                        done();
                    });
            });
            it('Give access error (without token)', (done) => {
                chai.request(server)
                    .put(`/docs/access/${newId}`)
                    .send({
                        _id: newId,
                        allowed_users: "hermione@granger.com"
                    })
                    .end((err, res) => {
                        res.should.have.status(500);

                        done();
                    });
            });
        });
    });
});
