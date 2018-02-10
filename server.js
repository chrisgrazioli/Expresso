const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');

const app = express();
const apiRouter = require('./api/api');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());
app.use('/api', apiRouter); // not enitrely sure of the order to follow here

app.listen(PORT, ()=>{
  console.log('Server Listening on port' + PORT);
});

module.exports = app;
