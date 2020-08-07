var express = require('express');
var app = express();
var cors = require('cors');

app.use(cors());
app.use(express.static('sprites'));
const path = require('path');


// main site
app.get('/', function(req, res, next) {
  res.header('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(4000);