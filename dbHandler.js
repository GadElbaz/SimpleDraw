var mysql = require('mysql');
var config = require('./config.js');
var con = mysql.createConnection(config.dbConfig);

// connect to db:
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var execSqlQuery = function(sqlQuery) {
    con.query(sqlQuery, function (err, result) {
    if (err) throw err;
    });
};

// insert user if doesnt exist:
var insertUser = function (userIp, userAgent) {
  execSqlQuery(`INSERT IGNORE INTO users (userip, useragent) VALUES ("${userIp}", "${userAgent}")`);
};
// insert board if doesnt exist:
var insertBoard = function (boardName) {
  execSqlQuery(`INSERT IGNORE INTO boards (name) VALUES ("${boardName}")`);
};
// get board id by board name:
var getBoardIdByName = function(boardName, callBack) {
  sqlQuery = `Select id from boards where boards.name = \"${boardName}\"`;
  con.query(sqlQuery, function (err, result) {
    if (err) throw err;
    return callBack(result[0].id);
  });
};
// get user id by ip and useragent:
var getUserIdByIpAndAgent = function(userIp, userAgent, callBack) {
  sqlQuery = `Select id from users where users.useragent = \"${userAgent}\" AND users.userip = \"${userIp}\"`;
  con.query(sqlQuery, function (err, result) {
    if (err) throw err;
    try {
      callBack(result[0].id)
    } catch{}
    return ;
  });
};
// select all shapes from db by board name:
var getShapesByBoardName = function(boardName, callBack) {
  getBoardIdByName(boardName, function(resBoardId){
    sqlQuery = `Select coordinates from shapes where shapes.boardid = ${resBoardId}`;
    con.query(sqlQuery, function (err, result) {
      if (err) throw err;
      return callBack(result);
    });
  });
};

// insert shape to DB:
var insertShapeToDB = function(coordinatesString, userAgent, userIp, boardName) {
  getBoardIdByName(boardName, function(boardId){
    getUserIdByIpAndAgent(userIp, userAgent, function(userId){
      sqlQuery = `INSERT INTO shapes (coordinates, boardid, userid) VALUES ('${coordinatesString}', ${boardId}, ${userId})`;
      execSqlQuery(sqlQuery);
      });
  });  
};
// check if board exists:
var checkIfBoardExists = function(boardName, callBack) {
  var sqlQuery = `SELECT 1 FROM boards WHERE boards.name = "${boardName}"`;
  con.query(sqlQuery, function (err, result, fields) {
    if (err) throw err;
    return callBack(!(result === undefined || result.length == 0));
  });
};
// check if user exists:
var checkIfUserExists = function(userIp, userAgent, callBack) {
  var sqlQuery = `SELECT 1 FROM users WHERE users.useragent = "${userAgent}" AND users.userip = "${userIp}"`
  con.query(sqlQuery, function (err, result, fields) {
    if (err) throw err;
    return callBack(!(result === undefined || result.length == 0));
  })
};

// check number of shapes per user for the last day:
// var getNumOfShapesByUser = function(userIp, userAgent, boardName, callBack){
//   var userId = getUserIdByIpAndAgent(userIp, userAgent);
//   var boardId = getBoardIdByName(boardName);
//   var sqlQuery = `SELECT COUNT * From shapes where `
// }

// expotrs:
module.exports.insertUser = insertUser;
module.exports.insertBoard = insertBoard;
module.exports.getBoardIdByName = getBoardIdByName;
module.exports.getUserIdByIpAndAgent = getUserIdByIpAndAgent;
module.exports.getShapesByBoardName = getShapesByBoardName;
// module.exports.getNumOfShapesByUser = getNumOfShapesByUser;
module.exports.insertShapeToDB = insertShapeToDB;
module.exports.checkIfBoardExists = checkIfBoardExists;
module.exports.checkIfUserExists = checkIfUserExists;