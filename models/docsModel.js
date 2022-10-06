const database = require("../db/conn.js");

const docs = {
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
        let db;

        let docs = {
            name: body.name,
            html: body.html,
            owner: body.owner,
            allowed_users: [body.owner]
        };

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
        console.log(myquery)
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
        console.log(body);
        let db;

        try {
            db = await database.getDb();

            const result = await db.collection.updateOne(myquery, body);

            console.log(`Document ${myquery._id} updated`);

            return result;
        } catch (error) {
            console.error(error.message);
        } finally {
            await db.client.close();
        }
    },
    giveAccess: async function giveAccess(myquery, body) {
        console.log(body);
        let db;

        let newvalues = {
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
    // delete: async function update(myquery) {
    //     let db;

    //     try {
    //         db = await database.getDb();

    //         const result = await db.collection.deleteOne(myquery);

    //         console.log("1 document deleted");

    //         return result;
    //     } catch (error) {
    //         console.error(error.message);
    //     } finally {
    //         await db.client.close();
    //     }
    // },
};

module.exports = docs;
