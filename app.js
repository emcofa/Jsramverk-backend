require('dotenv').config();

const express = require('express');

const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const visual = false;
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema
} = require("graphql");

const RootQueryType = require("./graphql/root.js");
const RootMutationType = require("./graphql/rootMutation.js");


const routeDocs = require("./routes/docs.js");
const routeAuth = require("./routes/auth.js");

const docsModel = require("./models/docsModel");
const app = express();
const httpServer = require("http").createServer(app);

const ObjectId = require("mongodb").ObjectId;
const authModel = require('./models/authModel.js');

const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());

app.options('*', cors());

app.disable('x-powered-by');

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/docs", routeDocs);
app.use("/", routeAuth);

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', authModel.verifyToken);
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: visual, // Visual är satt till true under utveckling
}));

app.get('/', (req, res) => {
    res.json({
        msg: "Docs",
    });
});

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        // origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT"]
    }
});

let throttleTimer;

io.sockets.on('connection', function (socket) {
    socket.on('create', function (room) {
        socket.join(room);
    });

    socket.on("docsData", function (data) {
        socket.to(data["_id"]).emit("docsData", data);

        let newValues = {
            $set: {
                name: data.name,
                html: data.html
            },
        };

        clearTimeout(throttleTimer);
        console.log("Writing");
        let dataId = {
            _id: ObjectId(data._id)
        };

        throttleTimer = setTimeout(async function () {
            await docsModel.update(dataId, newValues);
            console.log("Saved to database");
        }, 2000);
    });
});

const server = httpServer.listen(port, () => {
    console.log('docs api listening on port ' + port);
});

module.exports = server;
