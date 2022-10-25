/* global it describe before */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

chai.should();
chai.use(chaiHttp);

const database = require("../db/conn.js");
const collectionName = "docs";


describe('Test the routes.', () => {
    let token;
    let tempUser;

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
                        res.body.data.should.be.an("object");
                        res.body.data.message.should.equal("User successfully created.");
                        done();
                    });
                tempUser = user.email;
            });

            it('Register same email again', async () => {
                let user = {
                    email: tempUser,
                    password: "Hedwig"
                };

                chai.request(server)
                    .post("/register")
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.errors.message.should.equal("E-mail already exists.");
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
                        res.body.errors.message.should.equal("E-mail is not in correct format.");
                    });
            });
        });

        describe('POST /login', () => {
            it('Login user', async () => {
                let user = {
                    email: tempUser,
                    password: "RandomEmailToNotCreateMultipleUsers"
                };

                let res = await chai.request(server)
                    .post("/login")
                    .send(user);

                res.should.have.status(201);
                res.body.data.should.be.an("object");
                res.body.data.token.should.not.equal(null);

                token = res.body.data.token;
            });

            it('Login user without password', async () => {
                let user = {
                    email: tempUser,
                    password: ""
                };

                let res = await chai.request(server)
                    .post("/login")
                    .send(user);

                res.should.have.status(400);
                res.body.errors.message.should.equal("E-mail or password is missing.");
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
                res.body.errors.message.should.equal("User does not exist.");
            });

            it('Login user with wrong password', async () => {
                let user = {
                    email: tempUser,
                    password: "Hedwwig"
                };

                let res = await chai.request(server)
                    .post("/login")
                    .send(user);

                res.should.have.status(401);
                res.body.errors.message.should.equal("Password is not correct.");
            });
        });

        describe('GET /docs', () => {
            it('200 HAPPY PATH', (done) => {
                chai.request(server)
                    .get("/docs")
                    .set('x-access-token', token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        // res.body.should.be.an("object");
                        res.body.data.should.be.an("array");

                        done();
                    });
            });
            it('500 SAD PATH', (done) => {
                chai.request(server)
                    .get("/docs")
                    .end((err, res) => {
                        res.should.have.status(500);
                        res.body.message.should.equal("Error");
                        done();
                    });
            });
        });

        describe('POST & PUT /docs', () => {
            let newId;

            it('201 Insert new doc', (done) => {
                let doc = {
                    name: "Test Doc",
                    html: "Testing testing",
                    owner: "testing@test.se",
                    allowed_users: ["testing@test.se"]
                };

                chai.request(server)
                    .post("/docs")
                    .set('x-access-token', token)
                    .send(doc)
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.should.be.an("object");
                        res.body.data._id.should.not.equal(null);
                        res.body.data._id.should.be.a('string');
                        res.body.data.name.should.be.a('string');
                        res.body.data.html.should.be.a('string');
                        res.body.data.owner.should.be.a('string');
                        res.body.data.allowed_users.should.be.a('array');
                        newId = res.body.data._id;
                        done();
                    });
            });

            it('200 Update doc', (done) => {
                chai.request(server)
                    .put(`/docs/update/${newId}`)
                    .set('x-access-token', token)
                    .send({
                        $set: {
                            name: "Test Doc update",
                            html: "Testing testing update"
                        }
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an("object");
                        res.body.data.modifiedCount.should.equal(1);

                        done();
                    });
            });
            it('500 Update doc error (without token)', (done) => {
                chai.request(server)
                    .put(`/docs/update/${newId}`)
                    .send({
                        _id: newId,
                        name: "Test Doc",
                        html: "Testing testing"
                    })
                    .end((err, res) => {
                        res.should.have.status(500);
                        res.body.message.should.equal("Error");

                        done();
                    });
            });
            it('200 Get single doc', (done) => {
                chai.request(server)
                    .get(`/docs/docs/${newId}`)
                    .set('x-access-token', token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an("object");
                        res.body.data._id.should.be.an("string");
                        res.body.data.name.should.be.an("string");
                        res.body.data.html.should.be.an("string");
                        res.body.data.owner.should.be.an("string");
                        res.body.data.allowed_users.should.be.an("array");

                        done();
                    });
            });
            it('500 Get single doc error (without token)', (done) => {
                chai.request(server)
                    .get(`/docs/docs/${newId}`)
                    .end((err, res) => {
                        res.should.have.status(500);
                        res.body.message.should.equal("Error");

                        done();
                    });
            });
            it('200 Give access', (done) => {
                chai.request(server)
                    .put(`/docs/access/${newId}`)
                    .set('x-access-token', token)
                    .send({
                        _id: newId,
                        allowed_users: "hermione@granger.com"
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.data.modifiedCount.should.equal(1);
                        done();
                    });
            });
            it('500 Give access error (without token)', (done) => {
                chai.request(server)
                    .put(`/docs/access/${newId}`)
                    .send({
                        _id: newId,
                        allowed_users: "hermione@granger.com"
                    })
                    .end((err, res) => {
                        res.should.have.status(500);
                        res.body.message.should.equal("Error");

                        done();
                    });
            });
        });
        describe('GRAPHQL TEST', () => {
            const name = "Test doc";
            const html = "Test 123";
            const owner = "test@test.se";
            const allowedUsers = ["test@test.se"];
            let graphQLid;

            it('200 Insert document', (done) => {
                chai.request(server)
                    .post("/graphql")
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('x-access-token', token)
                    .send({
                        query: `mutation { insertDocument(name: "${name}",
                        html: "${html}", owner: "${owner}", allowed_users: "${allowedUsers}") {
                            _id, name, html, owner, allowed_users
                        } }` })
                    .end((err, res) => {
                        graphQLid = res.body.data.insertDocument._id;
                        res.should.have.status(200);
                        res.body.data.should.be.an("object");
                        res.body.data.insertDocument._id.should.be.an("string");
                        res.body.data.insertDocument.name.should.be.an("string");
                        res.body.data.insertDocument.html.should.be.an("string");
                        res.body.data.insertDocument.owner.should.be.an("string");
                        res.body.data.insertDocument.allowed_users.should.be.an("array");
                        done();
                    });
            });
            it('200 Update name', (done) => {
                chai.request(server)
                    .post("/graphql")
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('x-access-token', token)
                    .send({
                        query: `mutation { updateName(_id: "${graphQLid}",
                        name: "Update name test") {
                                name, _id
                        } }` })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.data.should.be.an("object");
                        done();
                    });
            });
            it('200 Give access', (done) => {
                chai.request(server)
                    .post("/graphql")
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('x-access-token', token)
                    .send({
                        query: `mutation { giveAccess(_id: "${graphQLid}",
                        allowed_users: "test2@test.se") {
                            allowed_users
                    } }` })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.data.should.be.an("object");
                        done();
                    });
            });
            it('400 Give access error', (done) => {
                chai.request(server)
                    .post("/graphql")
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('x-access-token', token)
                    .send({
                        query: `mutation { giveAccess(_id: "${graphQLid}",
                        allowed_users: error) {
                            allowed_users
                    } }` })
                    .end((err, res) => {
                        res.should.have.status(400);
                        done();
                    });
            });
            it('200 Update document', (done) => {
                chai.request(server)
                    .post("/graphql")
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('x-access-token', token)
                    .send({
                        query: `mutation { updateDocument(_id: "${graphQLid}",
                        name: "Update name test", html: "test") {
                                name, _id
                        } }` })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.data.should.be.an("object");
                        done();
                    });
            });
            it('200 Get docs', (done) => {
                chai.request(server)
                    .post("/graphql")
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('x-access-token', token)
                    .send({
                        query: "{ docs { name, html } }"
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.data.should.be.an("object");
                        res.body.data.docs[0].name.should.be.an("string");
                        res.body.data.docs[0].html.should.be.an("string");
                        done();
                    });
            });
        });
    });
});
