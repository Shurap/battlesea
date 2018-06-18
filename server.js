let express = require('express');
let app = express();
let lobby;
let objGamer1 = {};
let objGamer2 = {};
let lobbyName;


//создание сервера
let myServer = app.listen(process.env.PORT || 7777, function () {
  console.log('Сервер запущен и слушает порт', process.env.PORT || 7777);
});

//передача страницы
app.get('/', function (req, res) {
  app.use(express.static(__dirname + '/public'));
  res.sendFile(__dirname + '/public/html/index.html');
});

//создание сокета на сервере
let io = require('socket.io').listen(myServer);

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
  let gamerName = data.name;
  lobby = this.adapter.rooms[lobbyName];
  // создание комнаты
  if (lobby === undefined) {
  this.join(lobbyName);
  objGamer1['name'] = data.name;
  objGamer1['id'] = this.id;
  console.log('1 ', this.id);
  // присоединение к комнате
  } else if (lobby.length <= 1){
    this.join(lobbyName);
    objGamer2['name'] = data.name;
    objGamer2['id'] = this.id;

    console.log('2 ', this.id);
    console.log('3 ', lobby);

    io.in(lobbyName).emit('terminal', 'server> Игрок ' + gamerName + ' подключился к игре с именем - ' + lobbyName);
    io.in(lobbyName).emit('beginGame');
  //комната заполнена
  } else {
    this.emit('terminal', 'Уже подключились двое!');
  } //__________________________________________________________
}

function servBeginGame(data) {
  if (this.id === objGamer1.id) {
    objGamer1['array'] = data.arr;
  } else if (this.id === objGamer2.id) {
    objGamer2['array'] = data.arr;
  }
  if (objGamer1.array !== undefined) {
    console.log('4.1 ', objGamer1.name, objGamer1.id, objGamer1.array[0][0]);
    this.broadcast.emit('terminal', 'server> Игрок ' + objGamer2.name + ' расставил свои корабли');
  }
  if (objGamer2.array !== undefined) {
    console.log('4.2 ', objGamer2.name, objGamer2.id, objGamer2.array[0][0]);
    this.broadcast.emit('terminal', 'server> Игрок ' + objGamer1.name + ' расставил свои корабли');
  }

    //this.emit('battle');

    //this.broadcast.emit('terminal', 'игрок расставил корабли');
}

function servVerifShoot(data) {
  console.log ('shoot ', this.id, ' ', data);
}