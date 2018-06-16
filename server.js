var express = require('express');
var app = express();
//var path = require('path');
var gamers = [];
var gamersH =[];
var usersId = [];
var lobbyName;
var numberGamer = '1';
var arrField1 = [];




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
//io.sockets.on('connection', function (socket) {
io.on('connection', function (socket) {
  //console.log('Подключился клиент');
  socket.emit('connClient');
  socket.emit('terminal', "server> подключились к серверу");
  socket.on('name', servCreateNewGame);
  socket.on('field', servBeginGame);
  socket.on('shoot', servVerifShoot);
});


// создание комнаты и подключение игроков____________________
function servCreateNewGame(data) {
  lobbyName = data.game;
  let gamerName = data.name;
  let lobby = this.adapter.rooms[lobbyName];
  // создание комнаты
  if (lobby === undefined) {
  this.join(lobbyName);
  this.emit('terminal', 'server> Игрок ' + gamerName + ' cоздал игру с именем - ' + lobbyName);
  this.emit('terminal', 'server> Ждем подключения другого игрока...')
  // присоединение к комнате
  } else if (lobby.length <= 1){
    //console.log(lobby);
    //console.log(this.id);
    this.join(lobbyName);
    console.log(lobby);
    io.in(lobbyName).emit('terminal', 'server> Игрок ' + gamerName + ' подключился к игре с именем - ' + lobbyName);
    io.in(lobbyName).emit('beginGame');
  //комната заполнена
  } else {
    this.emit('terminal', 'Уже подключились двое!');
  } //__________________________________________________________
}

function servBeginGame(data) {
  if (numberGamer === '1') {
    const obj = {};
    arrField1 = data.arr;
    name1 = data.name;
    obj[data.name] = data.arr; // привязать id вместо имени
    //console.log(obj[data.name][1][1]);
    numberGamer = '2';
  } else if (numberGamer === '2') {
    arrField2 = data.arr;
    name2 = data.name;
    numberGamer = '1';
    //console.log(name1 + ' - ' + arrField1[0][0].content);
    //console.log(name2 + ' - ' + arrField2[0][0].content);
    this.emit('battle');
  }
  this.broadcast.emit('test', 'ответ сервера');
  //console.log('!!! ' + this.id);
}

function servVerifShoot(data) {
  console.log ('shoot ', this.id, ' ', data);
}