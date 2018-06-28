let socket;
let phaseGame;
let name;//---------------?
let lastId;

// Connect and listen server
btnNewGame.onclick = function() {
  socket = io.connect();
  socket.on('connClient', createGame);
  socket.on('terminal', getTerminal);
  socket.on('beginGame', beginGame);
  socket.on('checkShot', resultOfShot);
  socket.on('test', test);
};

// Create game and player connection
function createGame(data) {
// Hide old elements and show new elements
  document.getElementById('start').style.display = "none";
// Send name and title of game to server
  this.emit('name', {name : userName.value, game : gameName.value});
}

//Begin game (Phase 1)
function beginGame(){
  // Hide old elements and show new elements
  document.getElementById('home').style.display = "block";
  createBtnField('home');
  getTerminal('> Расставьте свои корабли');
  phaseGame = '1';
}

// message to terminal
function getTerminal(data) {
  document.getElementById('terminal').value += "\n" + data;
  document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
}

// Create field of buttons
function createBtnField(divId) {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let btnField = document.createElement('div');
      btnField.className = 'btn';
      btnField.addEventListener("click", clickOnButtonField);
      btnField.addEventListener("mouseenter", enterMouseOnButtonField);
      btnField.addEventListener("mouseleave", leaveMouseOnButtonField);
      btnField.id = divId.substr(0, 1) + String(i) + String(j);
      btnField.content = 'zero';
      btnField.adress = btnField.id;
      document.getElementById(divId).appendChild(btnField);
    }
  }
}

function clickOnButtonField() {
//Phase one - set ships on the field 'home'
  let self = this;
  if (phaseGame === '1') {
    setPictureOnButtonHomeField(self);
  }
//Phase two - set aim on the field 'enemy'
  if ((phaseGame === '2') && (this.adress.substr(0, 1) === 'e') && (this.textContent === '')) {
    setPictureOnButtonEnemyField(self);
  }
}

function enterMouseOnButtonField() {
  this.style.borderColor = "red";
  if ((phaseGame === '2') && (this.adress.substr(0, 1) === 'e')) {
    if (this.style.backgroundImage === '') {this.style.backgroundImage = 'url("../img/aim.png")'}
  }
}

function leaveMouseOnButtonField() {
  this.style.borderColor = "black";
  if ((phaseGame === '2') && (this.adress.substr(0, 1) === 'e')) {
    if (this.style.backgroundImage === 'url("../img/aim.png")') this.style.backgroundImage = '';
  }
}

function setPictureOnButtonHomeField(self) {
  if (verifArray('ship', 'home') < 5) {
    self.style.backgroundImage = (self.style.backgroundImage === '') ? 'url("../img/ship.png")' : '';
    self.content = (self.content === 'zero') ? 'ship' : 'zero';
    //btnPicture = (btnPicture = 'url("../img/ship.png")') ? 'url("../img/ship.png")' : '';
  } else {
//if stay 5 ships and 1 ships need remove
    self.style.backgroundImage = '';
    self.content = 'zero';
  }
}

function setPictureOnButtonEnemyField(self) {
  if (lastId) {
    if (document.getElementById(lastId).style.backgroundImage === 'url("../img/aimblack.png")') {
      document.getElementById(lastId).style.backgroundImage = '';
    }
  }
  self.style.backgroundImage = 'url("../img/aimblack.png")';
  lastId = self.id;
}

// Verification array of buttons for count... (what count, where find)
function verifArray(data, parentDiv) {
  let count = 0;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let index = parentDiv.substr(0, 1) + String(i) + String(j);
      if (document.getElementById(index).content === data) {
        count ++;
      }
    }
  }
  return count;
}

// Press button 'Enter', send to server
btnEnter.onclick = function () {
// Create array buttons and send to server
  if ((phaseGame === '1') && (verifArray('ship', 'home') === 5)) {
    let array = create2DArray(10, 10);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let index = String(i) + String(j);
        array[i][j] = document.getElementById('h' + index);
        array[i][j].adress = array[i][j].adress.substr(1, 2);
      }
    }
    socket.emit('field', {name : userName.value, arr : array});
    getTerminal('> Готово! Ждем другого игрока...');
    document.getElementById('enemy').style.display = "block";
    createBtnField('enemy');
    phaseGame = '2';
// Send to server shoot
  } else if (phaseGame === '2') {
    socket.emit('shoot', lastId.substr(1,2));
  }
};

// Create empty 2D array
function create2DArray(rows, columns) {
  let x = new Array(rows);
  for (let i = 0; i < rows; i++) {
    x[i] = new Array(columns);
  }
  return x;
}

function resultOfShot(data) {
  if (data.setOnField === 'e') {
    document.getElementById(data.setOnField + data.coord).textContent = data.countShips;
  }
  if (data.inTarget === 'hit') {
    document.getElementById(data.setOnField + data.coord).style.backgroundImage = 'url("../img/wreckship.png")';
  }
  if (data.inTarget === 'fail') {
    document.getElementById(data.setOnField + data.coord).style.backgroundImage = 'url("../img/water.png")';
  }
}

// тест
function test(data) {
  console.log(data);
}