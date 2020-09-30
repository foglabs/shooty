var express = require('express')
var app = express()
var cors = require('cors')
var bodyParser = require('body-parser')
var fs = require('fs')

// security headers
// var helmet = require('helmet')
// app.use(helmet())

app.use(cors())
app.use(express.static('app'))
app.use(bodyParser.json())
const path = require('path')

// main site
app.get('/', function(req, res, next){
  res.header('Content-Type', 'text/html')
  res.sendFile(path.join(__dirname, 'app', 'index.html'))
})

app.get('/score', function(req, res, next){
  fs.readFile(path.join(__dirname, '/data.txt'), 'utf8', function(err, data) {
    if (err) throw err
    let thisline
    let scores = []
    data.split("\n").map(function(line){
      thisline = line.split(",")
      if(thisline[0] && thisline[1] && thisline[2]){
        scores.push ({ score: thisline[0], level: thisline[1], name: thisline[2] } )
      }
    })

    scores = scores.sort((a,b) => { return b.score-a.score })
    console.log(scores)
    res.send(scores)
  });
})

app.post('/score', function(req, res, next) {
  console.log( 'ello', req )
  console.log( 'HELLO', req.body )
  if(!req.body.score && !req.body.level && !req.body.name){
    return res.send(400)
  }

  let score = req.body.score.replace(/\W/g, '')
  let level = req.body.level.replace(/\W/g, '')
  let name = req.body.name.replace(/\W/g, '')
  console.log( 'sanitized to', score, level, name )

  let row = [score,level,name].join(",") + "\n"
  console.log( row )
  let filePath = path.join(__dirname, 'data.txt')
  fs.appendFile(filePath, row, function(err) {
    if(err){
      console.log( 'YOU HAVE FAILED YOUR MASTER', err )
    } else {
      console.log( 'WRITING ROW', row )
      res.end()
    }
  })
  
})

app.listen(4000)