var WebSocket = require('ws');
var db = require('./dbHandler.js');
var config = require('./config.js');
var anyRE = /\/+/;
var express = require('express')
, http = require('http')
, fs = require('fs')
, path = require('path')
, bodyParser = require('body-parser');

var app = express();
app.set('port',  config.serverPort);
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var server = http.createServer(app);
var wss = new WebSocket.Server({ server });

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
      var boardName = message;
        db.checkIfBoardExists(boardName, function(res) {
          if(res){
            db.getShapesByBoardName(boardName, function(res) {
              res.forEach(function(element) {
                ws.send(element.coordinates);
              });
            });
          } else {
            db.insertBoard(boardName);
          }
        });
        ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, Welcom to Simple Draw! the simplest ;)');
});

// send broadcast to all conected users:
wss.broadcast = function broadcast(msg) {
  wss.clients.forEach(function each(client) {
    client.send(msg);
   });
};

server.listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

app.post(anyRE, function(req, res) {
  var userAgent = req.headers['user-agent'];
  var userIp = req.header('x-forwarded-for') || req.connection.remoteAddress;
  var boardName = req.path.trim();
  db.insertShapeToDB(req.body.coordinates, userAgent, userIp, boardName);
  wss.broadcast(req.body.coordinates)
});



//create a route
app.get(anyRE, function (req, res) {
  res.sendfile('public/canvas.html');
  var userIp = req.header('x-forwarded-for') || req.connection.remoteAddress;
  var userAgent = req.headers['user-agent'];
  db.checkIfUserExists(userIp, userAgent, function(res) {
    if(!res){
      db.insertUser(userIp, userAgent);
    }
  }); 
});
