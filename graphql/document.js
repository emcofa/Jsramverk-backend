const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLList,
    GraphQLID
} = require('graphql');

const DocumentType = new GraphQLObjectType({
    name: 'Documents',
    description: 'This represents documents in db',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: new GraphQLNonNull(GraphQLString) },
        html: { type: GraphQLString },
        owner: { type: GraphQLString },
        allowed_users: { type: new GraphQLList(GraphQLString) }
    })
});

module.exports = DocumentType;
