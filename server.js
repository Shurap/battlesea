var express = require('express');
var app = express();
//var path = require('path');

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
  console.log('Подключился клиент');
  socket.emit('connClient');
  socket.emit('terminal', "server> подключились к серверу");
  socket.on('name', servCreateNewGame);
});


// создание комнаты и подключение игроков
function servCreateNewGame(data) {
  let lobbyName = data.game;
  let gamerName = data.name;
  let lobby = this.adapter.rooms[lobbyName];

  // создание комнаты
  if (lobby === undefined) {
  this.join(lobbyName);
  lobby = this.adapter.rooms[lobbyName];
  this.emit('terminal', 'server> Игрок ' + gamerName + ' cоздал игру с именем - ' + lobbyName);

  // присоединение к комнате
  } else if (lobby.length <= 1){
    this.join(lobbyName);
    lobby = this.adapter.rooms[lobbyName];
    io.in(lobbyName).emit('terminal', 'server> Игрок ' + gamerName + ' подключился к игре с именем - ' + lobbyName);
  } else {
    this.emit('terminal', 'Уже подключились двое!');
  }
}