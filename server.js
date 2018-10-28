let express = require('express');
let app = express();
let allClients = [];
let countShips = require('./countships');

let myServer = app.listen(process.env.PORT || 7777, function () {
  //console.log('Сервер запущен и слушает порт', process.env.PORT || 7777);
});

app.get('/', function (req, res) {
  app.use(express.static(__dirname + '/public'));
  res.sendFile(__dirname + '/public/html/index.html');
});

let io = require('socket.io').listen(myServer);

io.on('connection', function (socket) {
  socket.emit('connClient');
  socket.emit('terminal', "server> подключились к серверу, ждем подключения второго игрока...");
  socket.on('name', connectToRoom);
  socket.on('field', getClientArray);
  socket.on('shoot', selectClient);
  socket.on('disconnect', disconnectClient);
});

function disconnectClient(){
  for (let i = 0; i <= allClients.length - 1; i++) {
    if (allClients[i].id === this.id) {
      let deletedGamer = allClients[i].lobby;
      allClients.splice(i, 1);
      for (let j=0; j <= allClients.length - 1; j++) {
        if (allClients[j].lobby === deletedGamer){
          io.to(allClients[j].id).emit('dis');
        }
      }
    }
  }
}

function connectToRoom(data) {
  let obj = {};
  let lobby = this.adapter.rooms[data.game];
  if (lobby === undefined) {
    this.join(data.game);
    obj['name'] = data.name;
    obj['id'] = this.id;
    obj['lobby'] = data.game;
    allClients.push(obj);
  } else if (lobby.length <= 1) {
    this.join(data.game);
    obj['name'] = data.name;
    obj['id'] = this.id;
    obj['lobby'] = data.game;
    allClients.push(obj);
    io.in(data.game).emit('beginGame');
  } else {
    this.emit('terminal', 'Уже подключились двое!');
    this.emit('dis');
  }
}

function setClient(what, where){
  return allClients.filter(function(item){
    return item[where] === what;
  });
}

function getClientArray(data) {
  allClients.forEach((item)=>{
    if (item.id === Object.keys(this.rooms)[0]){
      item['array'] = data;
    }
  });
  console.log('111  -  ', setClient(Object.keys(this.rooms)[1], 'lobby')[0]);//----------------------------------------------------
  if ((setClient(Object.keys(this.rooms)[1], 'lobby')[0].array) && (setClient(Object.keys(this.rooms)[1], 'lobby')[1].array)) {
    io.sockets.connected[setClient(Object.keys(this.rooms)[1], 'lobby')[0].id].emit('battle', 'turn');
    io.sockets.connected[setClient(Object.keys(this.rooms)[1], 'lobby')[1].id].emit('battle', 'wait');
  }
}

function selectClient(data) {
  let result;
  let gamer1 = setClient(Object.keys(this.rooms)[1], 'lobby')[0];
  let gamer2 = setClient(Object.keys(this.rooms)[1], 'lobby')[1];
  let gamerTarget = (this.id === gamer1.id) ? gamer2 : gamer1;
  let gamerShooter = (this.id === gamer1.id) ? gamer1 : gamer2;
  result = defineResultShot(data, gamerTarget.array);
  result.setOnField = 'e';
  io.sockets.connected[gamerShooter.id].emit('checkShot', result);
  result.setOnField = 'h';
  io.sockets.connected[gamerTarget.id].emit('checkShot', result);
}

function defineResultShot(data, target) {
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