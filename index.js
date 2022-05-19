const express = require("express");
      app     = express();
      router  = express.Router();
      mysql   = require('mysql');
      moment  = require('moment');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'rootroot',
  database: 'bulletin_board'
};

const conn = mysql.createConnection(dbConfig);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

const server = app.listen(3000, function() {
  console.log("Node.js is listening to PORT:" + server.address().port );
});

/*********************************** 
 * router
 ***********************************/

router.get("/", function(req, res, next) {
  const qry = 'SELECT *, DATE_FORMAT(created_at,  \'%Y年%m月%d日 %k時%i分%s秒\') AS created_at FROM boards'
  conn.query(qry, function(err, rows) {
    res.render("index", {
      title: "BBS Top Page",
      boardList: rows
    });  
  });
});

router.post("/", function(req, res, next) {
  var title = req.body.title;
  var createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  var qry = 'INSERT INTO boards (title, created_at)' +
            ' VALUES ("'+ title +'", "' + createdAt +'")'; 
  conn.query(qry, function(err, rows) {
    console.log(err);
    res.redirect('/');
  })
});

router.get("/boards/:board_id", function(req, res, next) {
  var boardId = req.params.board_id;
  var boardqry = 'SELECT * FROM boards WHERE board_id = ' + boardId;
  var msgqry = 'SELECT *, DATE_FORMAT(created_at, \'%Y年%m月%d日 %k時%i分%s秒\') AS created_at FROM message WHERE board_id = ' + boardId;
  conn.query(boardqry, function(err, board) {
    conn.query(msgqry, function(err, messages) {
      res.render('board', {
        title: board[0].title,
        board: board[0],
        messageList: messages
      });
    })
  });
});

router.post("/boards/:board_id", function(req, res, next) {
  var message = req.body.message;
  var boardId = req.params.board_id;
  var createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  var qry = 'INSERT INTO message (message, board_id, created_at)' + 
            'VALUES ("' + message + '", "' + boardId +'", "' + createdAt + '")'; 
  conn.query(qry, function(err, rows) {
    res.redirect('/boards/' + boardId);
  });
});

app.use('/', router);

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});