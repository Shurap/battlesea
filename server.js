let express = require('express');
let app = express();
let objGamer1 = {};
let objGamer2 = {};
let countShips = require('./countships');

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
  socket.emit('connClient');
  socket.emit('terminal', "server> подключились к серверу");
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
}

function servSelectClient(data) {
  let result;
  let postTo = (this.id === objGamer1.id) ? objGamer2.id : objGamer1.id;
  let getFrom = (this.id === objGamer1.id) ? objGamer1.id : objGamer2.id;

  if (postTo === objGamer1.id) result = defineResultShot(data, objGamer1.array);
  if (postTo === objGamer2.id) result = defineResultShot(data, objGamer2.array);

  io.sockets.connected[postTo].emit('terminal', data);
  io.sockets.connected[getFrom].emit('terminal', result);
  io.sockets.connected[getFrom].emit('checkShot', result);
  console.log('1) ', countShipsOnField(objGamer1.array));
  console.log('2) ', countShipsOnField(objGamer2.array));
}

function defineResultShot(data, target) {
  let coordX = data.substr(0, 1);
  let coordY = data.substr(1, 1);

  // hit to ship
  console.log(coordX, coordY);

  if (target[coordX][coordY].content === 'ship') {
    target[coordX][coordY].content = 'wreck';
    return {inTarget : 'hit',
            countShips : countShips.numberShips(coordX, coordY, target) + 1,
             coord : data};
    //return countShips.numberShips(coordX, coordY, target) + 1;
  }

  if (target[coordX][coordY].content === 'zero') {
    return countShips.numberShips(coordX, coordY, target)
  }
}

function countShipsOnField(data) {
    let result = data.reduce(function(count, current) {

    count = count + current.reduce(function(count1, current1){
      if (current1.content === 'ship') count1++;
      return count1;
    }, 0);

    return count;
  }, 0);
  return result;

/*  let count = 0;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (data[i][j].content === 'ship') count ++;
    }
  }
  return count;*/
}