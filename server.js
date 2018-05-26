var express = require('express');
var app = express();
var path = require('path');

//создание сервера
var myServer = app.listen(process.env.PORT || 7777, function () {
  console.log('Сервер запущен и слушает порт', process.env.PORT || 7777);
});

//передача страницы
app.get('/', function (req, res) {
  app.use(express.static(__dirname + '/public'));
  res.sendFile(__dirname + '/public/html/index.html');
});

//создание сокета на сервере
var io = require('socket.io').listen(myServer);


// слушает сокет
io.sockets.on('connection', function (socket) {
  console.log('Подключился клиент ');
  socket.emit('hello', "Привет");


  socket.on('name', function (data){
    //socket.join(data);
    console.log(data);
  })
});

