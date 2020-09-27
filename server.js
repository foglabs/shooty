var express = require('express');
var app = express();
var cors = require('cors');

var fs = require('fs');

app.use(cors());
app.use(express.static('app'));
const path = require('path');


// main site
app.get('/', function(req, res, next){
  res.header('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.post('/score', function(req, res, next) {
  console.log( 'HELLO', req.body )
  console.log( 'HELLO', req.query )
  if(!req.body.score && !req.body.level && !req.body.name){
    return res.send(400)
  }

  let row = 'poopin mhy brains out'
  console.log( row )
  let filePath = path.join(__dirname, 'data.txt')
  fs.appendFile(filePath, row, function() {
    console.log( 'LOL' )
    res.end();
  });
  

});

app.listen(4000);