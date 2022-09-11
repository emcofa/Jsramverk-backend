require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const path = require("path");
const routeDocs = require("./routes/docs.js");

const app = express();

const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());


app.options('*', cors());

app.disable('x-powered-by');

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
  // use morgan to log at command line
  app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/docs", routeDocs);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function(req,res) {

  res.sendFile(path.join(__dirname, 'build', 'index.html'));

});

app.get('/', (req, res) => {
    res.json({
        msg: "Docs",
    });
});

const server = app.listen(port, () => {
  console.log('docs api listening on port ' + port);
});

module.exports = server;