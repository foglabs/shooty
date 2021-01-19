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
  console.log( 'HELLO', req.body )
  if(!req.body.score && !req.body.level && !req.body.name){
    return res.send(400)
  }

  // let sexData = req.body.sex.split(":")
  // let keyActivity, pLevel, endTime, startTime
  // wash your fucking ass
  // keyActivity = parseInt( sexData[0].replace(/\W/g, '') )
  // pScore = 1000000000 - parseInt( sexData[1].replace(/\W/g, '') )
  // pLevel = parseInt( sexData[2].replace(/\W/g, '') )
  // endTime = parseInt( sexData[3].replace(/\W/g, '') )
  // startTime = parseInt( sexData[4].replace(/\W/g, '') )

  let score = req.body.score.replace(/\W/g, '')
  let level = req.body.level.replace(/\W/g, '')
  let name = req.body.name.replace(/\W/g, '')
  console.log( 'sanitized to', score, level, name )

  // we overshot
  // if(!(keyActivity && pLevel && endTime && startTime) || startTime > endTime || keyActivity < 5 || pLevel != level || (endTime - startTime) < 5000 ){
  //   return res.send(400)
  // }

  // console.log( 'hey stupid' )
  // console.log(validateKA(1496,1682,450678))
  // console.log(validateKA(71,5280,27986))
  // console.log(validateKA(62,2597,32143))
  // console.log(validateKA(36,2819,19634))
  // console.log(validateKA(43,5332,23929))
  // console.log(validateKA(21,7808,21583))
  // console.log(validateKA(82,3640,32191))
  // console.log(validateKA(400,3798,142265))

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

function validateKA(ka, startTime, endTime){
  let duration = endTime - startTime
  
  // ka = 1/300*duration
  // let expectedKA = 1/300 * duration

  // distance between real performance and expected, abs to get positive
  let dist = Math.abs( (-1*duration + 300*ka) / (Math.sqrt( Math.pow(-1, 2) + Math.pow(300, 2) )) )
  console.log( 'distance is ', dist )
  return dist < 150
}



app.listen(4000)