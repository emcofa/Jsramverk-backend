const database = require("../db/conn.js");
const initDocs = require("../data/docs.json");

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
    insertDoc: async function insertDoc(newDoc) {
        let db;

        try {
            db = await database.getDb();

            const result = await db.collection.insertOne(newDoc);

            return {
                ...newDoc,
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
    update: async function update(myquery, newvalues) {
        let db;

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
    init: async function init() {
        let db;

        try {
            db = await database.getDb();

            const result = await db.collection.insertMany(initDocs);

            console.log(`${result.insertedCount} documents were inserted`);
        } catch (error) {
            console.error(error.message);
        } finally {
            await db.client.close();
        }
    }
};

module.exports = docs;
