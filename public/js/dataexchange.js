// Make verification when 'wait opponent'. Button not press.

let socket;
let phaseGame = 'Create game';
let arrayHomeField = create2DArray(10, 10);
let arrayEnemyField = create2DArray(10, 10);
//let btnFieldHome = {};
//let name;//---------------?
//let lastId;

function create2DArray(rows, columns) {
  let x = new Array(rows);
  for (let i = 0; i < rows; i++) {
    x[i] = new Array(columns);
  }
  return x;
}

btnEnter.onclick = function () {
  if (phaseGame === 'Create game') {
    connectAndListenServer();
  }
  if ((phaseGame === 'Set on home field') && (countElements('ship', arrayHomeField) === 5)) {
    socket.emit('field', arrayHomeField);
    changeBtnEnter('Wait opponent...', '#FF7F00');
    phaseGame = 'Wait opponent';
  }
  //if ((phaseGame === 'Battle') && (this.id.slice(0, 1) === 'e')){
  //  console.log(arrayEnemyField);
  //}
}

function connectAndListenServer() {
  socket = io.connect();
  socket.on('connClient', createGame);
  socket.on('terminal', getTerminal);
  socket.on('beginGame', beginGame);
  socket.on('Battle', beginBattle);
  //-----------------------------socket.on('checkShot', resultOfShot);
}

function createGame() {
  document.getElementById('userName').style.display = "none";
  document.getElementById('gameName').style.display = "none";
  changeBtnEnter('Wait opponent...', '#FF7F00');
  phaseGame = 'wait opponent';
  this.emit('name', {name : userName.value, game : gameName.value});
}

function changeBtnEnter(data, color) {
  document.getElementById('btnEnter').value = data;
  document.getElementById('btnEnter').style.backgroundColor = color;
}

function getTerminal(data) {
  document.getElementById('terminal').value += "\n" + data;
  document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
}

function beginGame(){
  phaseGame = 'Set on home field';
  document.getElementById('start').style.display = "none";
  document.getElementById('home').style.display = "block";
  changeBtnEnter('Set 5 ships');
  createBtnField('home');
  createBtnField('enemy');
  getTerminal('> Расставьте 5 своих кораблей...');
}

function createBtnField(divId) {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let btnField = document.createElement('div');
      btnField.className = 'btn';
      btnField.addEventListener('click', clickOnButtonField);
      btnField.addEventListener('mouseenter', enterMouseOnButtonField);
      btnField.addEventListener('mouseleave', leaveMouseOnButtonField);
      btnField.id = divId.slice(0, 1) + String(i) + String(j);
      document.getElementById(divId).appendChild(btnField);

      if (divId === 'home') {
        arrayHomeField [i][j] = btnField;
        //arrayHomeField [i][j].adress = divId;
        arrayHomeField [i][j].content = 'empty';
      }
      if (divId === 'enemy') {
        arrayEnemyField [i][j] = btnField;
        //arrayEnemyField [i][j].adress = divId;
        arrayEnemyField [i][j].content = 'empty';
      }
    }
  }
}

function clickOnButtonField() {
  if (phaseGame === 'Set on home field') {
    if (countElements('ship', arrayHomeField) < 5) {
      arrayHomeField [this.id.slice(1, 2)][this.id.slice(2)].content =
        (arrayHomeField [this.id.slice(1, 2)][this.id.slice(2)].content === 'empty') ? 'ship' : 'empty';
    } else {
      arrayHomeField [this.id.slice(1, 2)][this.id.slice(2)].content = 'empty';
    }
    changeBtnEnter('Set ' + (5 - countElements('ship', arrayHomeField)) + ' ships', '#FF7F00');
    if (5 - countElements('ship', arrayHomeField) === 0) {
      changeBtnEnter('Begin battle!!!', '#00BB3F');
    }
  }
  if ((phaseGame === 'Battle') && (this.id.slice(0, 1) === 'e')) {

    if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content !== 'aim') {
      console.log('1');
      arrayEnemyField.forEach(function (item) {
        item.forEach(function (elem) {
          if (elem.content === 'aim') {
            elem.content = 'empty';
          }
        });
      });
    }

    //console.log('before ', arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content);
    if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content === 'empty'){
      arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content = 'aim';
    } else if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content === 'aim') {
      arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content = 'cross';
    } else if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content === 'cross') {
      arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content = 'put';
    }else if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content === 'put') {
      arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content = 'empty';
    }
    //console.log('after ', arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content);


    //arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content = 'aim';
  }
  setPictureOnButtonField();
}

function enterMouseOnButtonField() {
  this.style.borderColor = "red";
  if ((phaseGame === 'Battle') && (this.id.substr(0, 1) === 'e')) {
    if (this.style.backgroundImage === '') {this.style.backgroundImage = 'url("../img/aim.png")'}
  }
}

function leaveMouseOnButtonField() {
  this.style.borderColor = "black";
  if ((phaseGame === 'Battle') && (this.id.substr(0, 1) === 'e')) {
    if (this.style.backgroundImage === 'url("../img/aim.png")') this.style.backgroundImage = '';
  }
}

function setPictureOnButtonField() {
  //console.log('2 ', this);//-----------------------------------------------------------
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (arrayHomeField[i][j].content === 'ship') {
        document.getElementById('h' + i + j).style.backgroundImage = 'url("../img/ship.png")';
      }
      if (arrayHomeField[i][j].content === 'empty') {
        document.getElementById('h'+ i + j).style.backgroundImage = '';
      }

      if (arrayEnemyField[i][j].content === 'aim') {
        document.getElementById('e' + i + j).style.backgroundImage = 'url("../img/aimblack.png")';
      }
      if (arrayEnemyField[i][j].content === 'empty') {
        document.getElementById('e' + i + j).style.backgroundImage = '';
      }
      if (arrayEnemyField[i][j].content === 'cross') {
        document.getElementById('e' + i + j).style.backgroundImage = 'url("../img/cross.png")';
      }
      if (arrayEnemyField[i][j].content === 'put') {
        document.getElementById('e' + i + j).style.backgroundImage = 'url("../img/bomb.png")';
      }
    }
  }
}

function countElements(whatCount, whereCount) {
  return whereCount.reduce(function(count, current) {

    count = count + current.reduce(function(count1, current1){
      if (current1.content === whatCount) count1++;
      return count1;
    }, 0);

    return count;
  }, 0);
}

function beginBattle() {
  changeBtnEnter('Shot!', '#00BB3F');
  document.getElementById('enemy').style.display = "block";
//  createBtnField('enemy');
  getTerminal('>Установи прицел и нажми выстрел!');
  phaseGame = 'Battle';
}


/*
function connectAndListenServer() {
  socket = io.connect();
  socket.on('connClient', createGame);
  socket.on('terminal', getTerminal);
  socket.on('beginGame', beginGame);
  socket.on('checkShot', resultOfShot);
}

// Create game and player connection
function createGame() {
// Hide old elements and show new elements
  //document.getElementById('start').style.display = "none";
  document.getElementById('userName').style.display = "none";
  document.getElementById('gameName').style.display = "none";
  document.getElementById('btnEnter').value = 'Wait opponent...';

// Send name and title of game to server
  this.emit('name', {name : userName.value, game : gameName.value});
}

//Begin game (Phase 1)
function beginGame(){
  // Hide old elements and show new elements
  document.getElementById('start').style.display = "none";
  document.getElementById('home').style.display = "block";
  document.getElementById('btnEnter').value = 'Set 5 ships';
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
  } else {
//if stay 5 ships and 1 ships need remove
    self.style.backgroundImage = '';
    self.content = 'zero';
  }
  document.getElementById('btnEnter').value = (verifArray('ship', 'home') < 5) ?
    'Set ' + (5 - verifArray('ship', 'home')) + ' ships' :
    'Press to begin battle!!!';
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

// Press button 'Enter'
btnEnter.onclick = function () {
// connecting to server
  if (phaseGame === '0') {
    connectAndListenServer();
    document.getElementById('btnEnter').value = 'Set 5 ships';
// Create array buttons and send to server
  } else if ((phaseGame === '1') && (verifArray('ship', 'home') === 5)) {
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
  } else if ((phaseGame === '2') && (document.getElementById('btnEnter').style.backgroundColor !== '#FF7F00')) {
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
    document.getElementById('btnEnter').style.backgroundColor = '#FF7F00';
    document.getElementById('btnEnter').value = 'Ход соперника...';
  }
  if (data.setOnField === 'h') {
    document.getElementById('btnEnter').style.backgroundColor = '#00BB3F';
  }

  if ((data.inTarget === 'hit') || (data.inTarget === 'win')) {
    document.getElementById(data.setOnField + data.coord).style.backgroundImage = 'url("../img/wreckship.png")';
  }
  if (data.inTarget === 'fail') {
    document.getElementById(data.setOnField + data.coord).style.backgroundImage = 'url("../img/water.png")';
  }
  if ((data.setOnField === 'e') && (data.inTarget === 'win')) alert ('WIN!!!');
  if ((data.setOnField === 'h') && (data.inTarget === 'win')) alert ('LOST...');
}
*/