let express = require('express');
let app = express();
let objGamer1 = {};
let objGamer2 = {};
let countShips = require('./countships');

//Create server
let myServer = app.listen(process.env.PORT || 7777, function () {
  //console.log('Сервер запущен и слушает порт', process.env.PORT || 7777);
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
  socket.emit('connClient');
  socket.emit('terminal', "server> подключились к серверу, ждем подключения второго игрока...");
  socket.on('name', servCreateNewGame);
  socket.on('field', servBeginGame);
  socket.on('shoot', servSelectClient);
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
//Connect to room 2nd
  } else if (lobby.length <= 1){
    this.join(lobbyName);
    objGamer2['name'] = data.name;
    objGamer2['id'] = this.id;

    //io.in(lobbyName).emit('terminal', 'server> Игрок ' + gamerName + ' подключился к игре с именем - ' + lobbyName);
    io.sockets.connected[objGamer2.id].emit('terminal', 'server> игрок ' + objGamer1.name +
                                            ' подключился к игре с названием ' + lobbyName);
    io.sockets.connected[objGamer1.id].emit('terminal', 'server> игрок ' + objGamer2.name +
                                            ' подключился к игре с названием ' + lobbyName);
    io.in(lobbyName).emit('beginGame');
//If room is full
  } else {
    this.emit('terminal', 'Уже подключились двое!');
  }
}

//Write to objGamer array
function servBeginGame(data) {
  if (this.id === objGamer1.id) {
    objGamer1['array'] = data;
    io.sockets.connected[objGamer2.id].emit('terminal', 'server> игрок ' + objGamer1.name + ' готов к бою!');
  } else if (this.id === objGamer2.id) {
    objGamer2['array'] = data;
    io.sockets.connected[objGamer1.id].emit('terminal', 'server> игрок ' + objGamer2.name + ' готов к бою!');
  }
  if ((objGamer1.array) && (objGamer2.array)) {
    //io.emit('Battle');
    io.sockets.connected[objGamer1.id].emit('Battle', 'turn');
    io.sockets.connected[objGamer2.id].emit('Battle', 'wait');
  }
}

function servSelectClient(data) {
  console.log('1', data);
  let result;
  let gamerTarget = (this.id === objGamer1.id) ? objGamer2 : objGamer1;
  let gamerShooter = (this.id === objGamer1.id) ? objGamer1 : objGamer2;

  result = defineResultShot(data, gamerTarget.array);
  result.setOnField = 'e';
  io.sockets.connected[gamerShooter.id].emit('checkShot', result);
  console.log('Shooter - ', result);
  result.setOnField = 'h';
  io.sockets.connected[gamerTarget.id].emit('checkShot', result);
  console.log('Target - ', result);
}

function defineResultShot(data, target) {
  console.log('proc');
  let coordX = data.substr(0, 1);
  let coordY = data.substr(1, 1);

  if (target[coordX][coordY].content === 'ship') {
    target[coordX][coordY].content = 'wreck';
    if (countShipsOnField(target) === 0) {
      return {inTarget : 'win',
        countShips : countShips.numberShips(coordX, coordY, target) + 1,
        coord : data,
        setOnField : ''};
    }
    return {inTarget : 'hit',
            countShips : countShips.numberShips(coordX, coordY, target) + 1,
            coord : data,
            setOnField : ''};
  }
  if (target[coordX][coordY].content === 'empty') {
    return {inTarget : 'fail',
      countShips : countShips.numberShips(coordX, coordY, target),
      coord : data,
      setOnField : ''};
  }
}

function countShipsOnField(data) {
    return data.reduce(function(count, current) {

    count = count + current.reduce(function(count1, current1){
      if (current1.content === 'ship') count1++;
      return count1;
    }, 0);

    return count;
  }, 0);
}