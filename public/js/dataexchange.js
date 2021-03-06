const ORANGE = '#FF7F00';
const GREEN = '#00BB3F';
let socket;
let phaseGame = 'Create game';
let arrayHomeField = create2DArray(10, 10);
let arrayEnemyField = create2DArray(10, 10);

function create2DArray(rows, columns) {
  let x = new Array(rows);
  for (let i = 0; i < rows; i++) {
    x[i] = new Array(columns);
  }
  return x;
}

btnEnter.onclick = function() {
  if (phaseGame === 'Create game') {
    if (/[a-zA-Zа-яА-я]/.test(document.getElementById('gameName').value) === false) {
      alert('Название игры должно содержать хотя бы одну букву!');
    } else {
      connectAndListenServer();
    }
  }
  if ((phaseGame === 'Set on home field') && (countElements('ship', arrayHomeField) === 5)) {
    socket.emit('field', arrayHomeField);
    changeBtnEnter('Wait opponent...', ORANGE);
    phaseGame = 'Wait opponent';
  }
  if ((phaseGame === 'Battle') && (document.getElementById('btnEnter').value === 'Shot!')){
    if (countElements('aim', arrayEnemyField) === 1) {
      socket.emit('shoot', adressElement(arrayEnemyField, 'aim'));
    } else {
      getTerminal('> Установите прицел!');
    }
  }
  if (phaseGame === 'Game over') {
    location.reload(true);
  }
}

btnHelp.onclick = function() {
  document.getElementById('help').style.display = "flex";
  document.getElementById('shadow').style.display = "block";
  document.getElementById('modal').style.display = "block";
}

shadow.onclick = function() {
  document.getElementById('help').style.display = "none";
  document.getElementById('shadow').style.display = "none";
  document.getElementById('modal').style.display = "none";
}

modal.onclick = function() {
  document.getElementById('help').style.display = "none";
  document.getElementById('shadow').style.display = "none";
  document.getElementById('modal').style.display = "none";
}

function connectAndListenServer() {
  socket = io.connect();
  socket.on('connClient', createGame);
  socket.on('terminal', getTerminal);
  socket.on('beginGame', beginGame);
  socket.on('battle', beginBattle);
  socket.on('checkShot', resultOfShot);
  socket.on('dis', disconnect);
}

function disconnect() {
  changeBtnEnter('Opponent disconnect. Game over. Press to start over!', ORANGE);
  socket.disconnect();
  phaseGame = 'Game over';
}

function createGame() {
  document.getElementById('userName').style.display = "none";
  document.getElementById('gameName').style.display = "none";
  changeBtnEnter('Wait opponent...', ORANGE);
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
        arrayHomeField [i][j].count = '';
        arrayHomeField [i][j].content = 'empty';
      }
      if (divId === 'enemy') {
        arrayEnemyField [i][j] = btnField;
        arrayEnemyField [i][j].count = '';
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
    changeBtnEnter('Set ' + (5 - countElements('ship', arrayHomeField)) + ' ships', ORANGE);
    if (5 - countElements('ship', arrayHomeField) === 0) {
      changeBtnEnter('Begin battle!!!', GREEN);
    }
  }
  if ((phaseGame === 'Battle') && (this.id.slice(0, 1) === 'e')) {
    if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content !== 'aim') {
      //-------------------------------------------------------
      arrayEnemyField.forEach(function (item) {
        item.forEach(function (elem) {
          if (elem.content === 'aim') {
            elem.content = 'empty';
          }
        });
      });
      //-----------------------------------------------------
    }
    if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content === 'empty'){
      arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content = 'aim';
    } else if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content === 'aim') {
      arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content = 'cross';
    } else if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content === 'cross') {
      arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content = 'put';
    }else if (arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content === 'put') {
      arrayEnemyField [this.id.slice(1, 2)][this.id.slice(2)].content = 'empty';
    }
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
  let pictureOne;
  let pictureFirst;
  let pictureSecond;
  let pictureAll;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {

      switch (arrayHomeField[i][j].content){
        case 'empty':
          pictureOne = '';
          break;
        case 'ship':
          pictureOne = 'url("../img/ship.png")';
          break;
        case 'wreck':
          pictureOne = 'url("../img/wreckship.png")';
          break;
        case 'water':
          pictureOne = 'url("../img/water.png")';
          break;
      }
      document.getElementById('h' + i + j).style.backgroundImage = pictureOne;

      switch (arrayEnemyField[i][j].content){
        case 'aim':
          pictureFirst = 'url("../img/aimblack.png")';
          break;
        case 'empty':
          pictureFirst = '';
          break;
        case 'cross':
          pictureFirst = 'url("../img/cross.png")';
          break;
        case 'put':
          pictureFirst = 'url("../img/bomb.png")';
          break;
        case 'wreck':
          pictureFirst = 'url("../img/wreckship.png")';
          break;
        case 'water':
          pictureFirst = 'url("../img/water.png")';
          break;
      }
      switch (arrayEnemyField[i][j].count){
        case 0:
          pictureSecond = 'url("../img/0.png")';
          break;
        case 1:
          pictureSecond = 'url("../img/1.png")';
          break;
        case 2:
          pictureSecond = 'url("../img/2.png")';
          break;
        case 3:
          pictureSecond = 'url("../img/3.png")';
          break;
        case 4:
          pictureSecond = 'url("../img/4.png")';
          break;
        case 5:
          pictureSecond = 'url("../img/5.png")';
          break;
        case '':
          pictureSecond = '';
          break;
      }
      pictureAll = (pictureSecond === '') ? pictureFirst : pictureSecond + ',' + pictureFirst;
      document.getElementById('e' + i + j).style.backgroundImage = pictureAll;
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

function beginBattle(data) {
  if (data === 'turn') {
    changeBtnEnter('Shot!', GREEN);
  }
  if (data === 'wait') {
    changeBtnEnter('Wait opponent...', ORANGE);
  }
  document.getElementById('enemy').style.display = "block";
  getTerminal('>Установи прицел и нажми выстрел!');
  phaseGame = 'Battle';
}

function adressElement(where, what) {

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (where[i][j].content === what) {
        return where[i][j].id.slice(1);
      }
    }
  }
}

function resultOfShot(data) {
  console.log(data);//------------------------------------------------------------------
  let arrayWork = (data.setOnField === 'e') ? arrayEnemyField : arrayHomeField;

  if (data.setOnField === 'h') {
    changeBtnEnter('Shot!', GREEN);
  }
  if (data.setOnField === 'e') {
    changeBtnEnter('Wait opponent...', ORANGE);
  }
  if ((data.inTarget === 'hit') || (data.inTarget === 'win')) {
    arrayWork [data.coord.slice(0, 1)][data.coord.slice(1)].content = 'wreck';
    arrayWork [data.coord.slice(0, 1)][data.coord.slice(1)].count = data.countShips;
  }
  if (data.inTarget === 'fail') {
    arrayWork [data.coord.slice(0, 1)][data.coord.slice(1)].content = 'water';
    arrayWork [data.coord.slice(0, 1)][data.coord.slice(1)].count = data.countShips;
  }
  setPictureOnButtonField();
  if ((data.setOnField === 'e') && (data.inTarget === 'win')) alert ('YOU WIN!!!');
  if ((data.setOnField === 'h') && (data.inTarget === 'win')) alert ('YOU LOST...');
}
