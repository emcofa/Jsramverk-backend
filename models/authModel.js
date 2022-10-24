const database = require("../db/conn.js");

const validator = require("email-validator");
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const jwt = require('jsonwebtoken');

let secret;

if (`${process.env.NODE_ENV}` === 'test') {
    secret = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N"
    "1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsI"
    "mV4cCI6MTY2NjYwNzkwMiwiaWF0IjoxNjY2NjA3OTAyfQ.HlF"
    "gbsbxgGJFGPjx1VmAMWNI63Fa_qT24g0L76Pb_IU";
} else {
    secret = `${process.env.ACCESS_TOKEN_SECRET}`;
}

const authModel = {
    register: async function register(res, body) {
        const email = body.email;
        const password = body.password;

        let emailExists = await authModel.verifyEmail(email);

        if (!email || !password) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    message: "E-mail or password is missing",
                }
            });
        }

        if (!validator.validate(email)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    message: "E-mail is not in correct format",
                }
            });
        }

        if (!emailExists) {
            authModel.hashPassword(res, body, password, email);
        } else {
            return res.status(400).json({
                errors: {
                    status: 400,
                    message: "E-mail already exists",
                }
            });
        }
    },
    hashPassword: async function hasPassword(res, body, password, email) {
        bcrypt.hash(password, saltRounds, async function (err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        message: "Could not hash password",
                    }
                });
            }

            let db = await database.getDb("users");

            try {
                const doc = {
                    email: email,
                    password: hash,
                };

                await db.collection.insertOne(doc);

                return res.status(201).json({
                    data: {
                        message: "User successfully created."
                    }
                });
            } catch (error) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        message: "Could not create new user",
                    }
                });
            } finally {
                await db.client.close();
            }
        });
    },

    login: async function login(res, body) {
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    message: "E-mail or password is missing",
                }
            });
        }

        let db = await database.getDb("users");

        try {
            const query = { email: email };

            const user = await db.collection.findOne(query);

            if (user) {
                return authModel.comparePasswords(res, user, password);
            }

            return res.status(401).json({
                data: {
                    message: "User does not exist."
                }
            });
        } catch (error) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    message: "Could not find user",
                }
            });
        } finally {
            await db.client.close();
        }
    },
    findUser: async function (filter) {
        let db;

        try {
            db = await database.getDb("users");
            const result = await db.collection.findOne(filter);

            return result;
        } catch (error) {
            return {
                errors: {
                    message: error.message,
                }
            };
        } finally {
            await db.client.close();
        }
    },
    verifyEmail: async function verifyEmail(email) {
        let emailObj = { email: email };
        let user = await authModel.findUser(emailObj);

        if (user) {
            return true;
        } else {
            return false;
        }
    },
    comparePasswords: async function comparePasswords(res, user, password) {
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        message: "Could not decrypt password."
                    }
                });
            }

            if (result) {
                const payload = { email: user.email };

                const token = jwt.sign(payload, secret, { expiresIn: '1h' });

                return res.status(201).json({
                    data: {
                        _id: user["_id"],
                        email: user.email,
                        token: token,
                    }
                });
            }

            return res.status(401).json({
                errors: {
                    status: 401,
                    message: "Password not correct"
                }
            });
        });
    },

    verifyToken: function (req, res, next) {
        const token = req.headers['x-access-token'];

        jwt.verify(token, secret, function (err) {
            if (err) {
                console.log('error');
                return res.status(500).json({
                    message: "Error"
                });
            }
            next();
        });
    }
};

module.exports = authModel;
