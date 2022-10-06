const ObjectId = require('mongodb').ObjectId;

const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLString,
    GraphQLID,
    GraphQLNonNull,
    graphql
} = require('graphql');

const DocumentType = require("./document.js");

const docs = require("../models/docsModel.js");

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        insertDocument: {
            type: DocumentType,
            description: 'Insert doc',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                html: { type: GraphQLString },
                owner: { type: GraphQLString },
                allowed_users: { type: new GraphQLList(GraphQLString) }
            },
            resolve: async function (parent, args) {
                const insertedDoc = await docs.insertDoc(args);

                return insertedDoc;
            }
        },
        updateDocument: {
            type: DocumentType,
            description: 'Update doc',
            args: {
                _id: { type: GraphQLID },
                name: { type: new GraphQLNonNull(GraphQLString) },
                html: { type: GraphQLString }
            },
            resolve: async function (parent, args) {
                let newvalues = {
                    name: args.name,
                    html: args.html
                };

                const updatedDoc = await docs.update({_id: new ObjectId(args._id)}, {$set:newvalues})

                return updatedDoc;
            }
        },
        updateName: {
            type: DocumentType,
            description: 'Update doc',
            args: {
                _id: { type: GraphQLID },
                name: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async function (parent, args) {
                let newvalues = {
                    name: args.name
                };

                const updatedDoc = await docs.update({_id: new ObjectId(args._id)}, newvalues)

                return updatedDoc;
            }
        },
        giveAccess: {
            type: DocumentType,
            description: 'Give access',
            args: {
                _id: { type: GraphQLID },
                allowed_users: { type: GraphQLString }
            },
            resolve: async function (parent, args) {
                const updatedDoc = await docs.giveAccess({_id: new ObjectId(args._id)}, {allowed_user: args.allowed_users})

                return updatedDoc;
            }
        }
    })
});

module.exports = RootMutationType;