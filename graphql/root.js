const ObjectId = require('mongodb').ObjectId;

const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLID
} = require('graphql');

// const UserType = require("./user.js");
const DocumentType = require("./document.js");

const docs = require("../models/docsModel.js");

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        docs: {
            type: new GraphQLList(DocumentType),
            description: 'List of all docs',
            resolve: async function () {
                const allDocs = await docs.getAllDocs();

                return allDocs;
            }
        },
        singleDoc: {
            type: DocumentType,
            description: 'A single doc',
            args: {
                _id: { type: GraphQLID }
            },
            resolve: async function (parent, args) {
                const doc = await docs.getById({ _id: new ObjectId(args._id) });

                return doc;
            }
        },
    })
});

module.exports = RootQueryType;
