let express = require('express');
let app = express();
let objGamer1 = {};
let objGamer2 = {};
var countShips = require('./countships');

//Create server
let myServer = app.listen(process.env.PORT || 7777, function () {
  console.log('Сервер запущен и слушает порт', process.env.PORT || 7777);
});

//Send site to client
app.get('/', function (req, res) {
  app.use(express.static(__dirname + '/public'));
  res.sendFile(__dirname + '/public/html/index.html');
});

//Create socket on server
let io = require('socket.io').listen(myServer);

//Listen client
io.on('connection', function (socket) {
//io.sockets.on('connection', function (socket) {
  //console.log('Подключился клиент');
  socket.emit('connClient');
  socket.emit('terminal', "server> подключились к серверу");
  socket.on('name', servCreateNewGame);
  socket.on('field', servBeginGame);
  socket.on('shoot', servVerifShoot);
});

//Create room and connect gamers. Create objGamer with name, id
function servCreateNewGame(data) {
  let lobbyName = data.game;
  let gamerName = data.name;
  let lobby = this.adapter.rooms[lobbyName];
//Create room and connect 1st
  if (lobby === undefined) {
  this.join(lobbyName);
  objGamer1['name'] = data.name;// .name
  objGamer1['id'] = this.id;
  console.log('1 ', this.id);
//Connect to room 2nd
  } else if (lobby.length <= 1){
    this.join(lobbyName);
    objGamer2['name'] = data.name;
    objGamer2['id'] = this.id;

    console.log('2 ', this.id);
    console.log('3 ', lobby);

    io.in(lobbyName).emit('terminal', 'server> Игрок ' + gamerName + ' подключился к игре с именем - ' + lobbyName);
    io.in(lobbyName).emit('beginGame');
//If room is full
  } else {
    this.emit('terminal', 'Уже подключились двое!');
  }
}

//Write to objGamer array
function servBeginGame(data) {
  if (this.id === objGamer1.id) {
    objGamer1['array'] = data.arr;
  } else if (this.id === objGamer2.id) {
    objGamer2['array'] = data.arr;
  }
  if (objGamer1.array !== undefined) {
    console.log('4.1 ', objGamer1.name, objGamer1.id, objGamer1.array[0][0]);
    //this.broadcast.emit('terminal', 'server> Игрок ' + objGamer1.name + ' расставил свои корабли');

  }
  if (objGamer2.array !== undefined) {
    console.log('4.2 ', objGamer2.name, objGamer2.id, objGamer2.array[0][0]);
    //this.broadcast.emit('terminal', 'server> Игрок ' + objGamer2.name + ' расставил свои корабли');
  }

    //this.emit('battle');

    //this.broadcast.emit('terminal', 'игрок расставил корабли');
}

function servVerifShoot(data) {
  console.log ('shoot ', this.id, ' ', data);
  let postTo = (this.id === objGamer1.id) ? objGamer2.id : objGamer1.id;
  let target = (postTo === objGamer1.id) ? objGamer1.array : objGamer2.array;
  let result = battle(data, target);

  io.sockets.connected[postTo].emit('terminal', result);

}

function battle(data, target) {
  let coordX = data.substr(0, 1);
  let coordY = data.substr(1, 1);

  if (target[coordX][coordY].content === 'ship') {

    return countShips.numberShips(coordX, coordY, target);
    //return 'hit';
  } else {
    return 'fail';
  }

}

/*function numberShips(coordX, coordY, target) {
  let count = 0;
//vertical
  for (let i = 0; i < 10; i++) {
    if (i !== +coordX) {
      if (target[i][coordY].content === 'ship') count++;
    }
  }
//horizontal
  for (let i = 0; i < 10; i++) {
    if (i !== +coordY) {
      if (target[coordX][i].content === 'ship') count++;
    }
  }
  let i = coordX;
  let j = coordY;
  while ((i < 9) && (j < 9)) {
    i++;
    j++;
    if (target[i][j].content === 'ship') count++;
  }
  i = coordX;
  j = coordY;
  while ((i > 0) && (j > 0)) {
    i--;
    j--;
    if (target[i][j].content === 'ship') count++;
  }
  i = coordX;
  j = coordY;
  while ((i < 9) && (j > 0)) {
    i++;
    j--;
    if (target[i][j].content === 'ship') count++;
  }
  i = coordX;
  j = coordY;
  while ((i > 0) && (j < 9)) {
    i--;
    j++;
    if (target[i][j].content === 'ship') count++;
  }
    return count;
}*/