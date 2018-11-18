var mysql = require('mysql');
var config = require('./config.js')

var con = mysql.createConnection(config.dbConfig);

// connect to db:
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var createUserTableQuery = "CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY, userip VARCHAR(255) NOT NULL, useragent VARCHAR(255) NOT NULL, UNIQUE INDEX username_unique (userip, useragent))";
var createBoardTableQuery = "CREATE TABLE boards(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE KEY)";
var createShapeTableQuery = "CREATE TABLE shapes(id INT AUTO_INCREMENT PRIMARY KEY, coordinates TEXT NOT NULL, boardid INT NOT NULL, userid INT NOT NULL, time TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (boardid) REFERENCES boards(id), FOREIGN KEY (userid) REFERENCES users(id))";

var execSqlQuery = function(tableName, sqlQuery) {
    con.query(sqlQuery, function (err, result) {
    if (err) throw err;
    console.log(tableName + " Table created");
    });
};

execSqlQuery("users", createUserTableQuery);
execSqlQuery("boards", createBoardTableQuery);
execSqlQuery("shapes", createShapeTableQuery);

