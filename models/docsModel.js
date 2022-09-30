const database = require("../db/conn.js");

const docs = {
    getUser: async function getUser(body) {
        let filter = { email: body.email };
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
    getAllDocs: async function getAllDocs() {
        let db;

        try {
            db = await database.getDb();

            const allDocs = await db.collection.find().toArray();

            return allDocs;
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
    insertDoc: async function insertDoc(body) {
        console.log(body);
        let db;

        let docs = {
            name: body.name,
            html: body.html,
            owner: body.owner,
            allowed_users: [body.owner]
        }
        try {
            db = await database.getDb();

            const result = await db.collection.insertOne(docs);

            return {
                ...body,
                _id: result.insertedId,
            };
        } catch (error) {
            console.error(error.message);
        } finally {
            await db.client.close();
        }
    },

    getById: async function getById(myquery) {
        let db;

        try {
            db = await database.getDb();

            const result = await db.collection.findOne(myquery);

            return result;
        } catch (error) {
            console.error(error.message);
        } finally {
            await db.client.close();
        }
    },
    update: async function update(myquery, body) {
        console.log(myquery)
        console.log(body)
        let db;

        console.log(body.allowed_user);

        let newvalues = {
            $set: {
                name: body.name,
                html: body.html
            }
        };

        try {
            db = await database.getDb();

            const result = await db.collection.updateOne(myquery, newvalues);

            console.log("1 document updated");

            return result;
        } catch (error) {
            console.error(error.message);
        } finally {
            await db.client.close();
        }
    },
    giveAccess: async function giveAccess(myquery, body) {
        console.log(myquery);
        console.log("body", body);
        let db;

        // console.log(body.allowed_user);

        let newvalues = {
            $set: {
                name: body.name,
                html: body.html
            },
            $push: { allowed_users: body.allowed_user }
        };

        try {
            db = await database.getDb();

            const result = await db.collection.updateOne(myquery, newvalues);

            console.log("1 document updated");

            return result;
        } catch (error) {
            console.error(error.message);
        } finally {
            await db.client.close();
        }
    },
    delete: async function update(myquery) {
        let db;

        try {
            db = await database.getDb();

            const result = await db.collection.deleteOne(myquery);

            console.log("1 document deleted");

            return result;
        } catch (error) {
            console.error(error.message);
        } finally {
            await db.client.close();
        }
    },
};

module.exports = docs;
