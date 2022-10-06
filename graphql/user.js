const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');

const UserType = new GraphQLObjectType({
    name: 'Users',
    description: 'This represents users in db',
    fields: () => ({
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLString }
    })
})

module.exports = UserType;