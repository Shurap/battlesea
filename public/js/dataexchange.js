let socket;
let phaseGame;
let name;//---------------?
let postId;
let btnPicture;
// Connect and listen server
btnNewGame.onclick = function() {
  socket = io.connect();
  socket.on('connClient', createGame);
  socket.on('terminal', getTerminal);
  socket.on('beginGame', beginGame);
  socket.on('battle', battle);
  socket.on('test', test);
};

// Create game and player connection
function createGame(data) {
// Hide old elements and show new elements
  document.getElementById('start').style.display = "none";
// Send name and title of game to server
  this.emit('name', {name : userName.value, game : gameName.value});
  //phaseGame = '1';
}

//Begin game (Phase 1)
function beginGame(){
  // Hide old elements and show new elements
  document.getElementById('home').style.display = "block";
  createBtnField('home');
  getTerminal('> Расставьте свои корабли');
  phaseGame = '1';
}

// Create field of buttons
function createBtnField(divId) {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let btnField = document.createElement('div');
      btnField.className = 'btn';
      btnField.addEventListener("click", click);
      btnField.addEventListener("mouseenter", btnBorder);
      btnField.addEventListener("mouseleave", btnBackPicture);
      btnField.id = divId.substr(0, 1) + String(i) + String(j);
      //btnField.parent = divId.substr(0, 1);
      btnField.content = 'zero';
      btnField.adress = btnField.id;
      //btnField.allowpress = (divId === 'enemy') ? true : false;
      document.getElementById(divId).appendChild(btnField);
    }
  }
}

// Handler event - press button of field
function click() {
//Phase one - arrange ships on the field 'home'
  if (phaseGame === '1') {
    if (verifArray('ship', 'home') < 5) {
      this.style.backgroundImage = (this.style.backgroundImage === '') ? 'url("../img/ship.jpg")' : '';
      this.content = (this.content === 'zero') ? 'ship' : 'zero';
    } else {
      this.style.backgroundImage = '';
      this.content = 'zero';
    }
  }
//Phase two - set aim on the field 'enemy'
  if ((phaseGame === '2') && (this.adress.substr(0, 1) === 'e')) {
    //this.textContent = 'O';
    if (postId) {
      document.getElementById(postId).style.backgroundImage = '';
      document.getElementById(postId).content = 'zero';
    }
    this.style.backgroundImage = 'url("../img/aimblack.png")';
    postId = this.id;
  }
  btnPicture = this.style.backgroundImage;
  //console.log(postId || this.id, ' ', btnPicture, verifArray('aim', 'enemy'));

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
// Create array button and send to server
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
    socket.emit('shoot', postId.substr(1,2));
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

// Change picture (phase 2) and border of buttons
function btnBorder() {
  btnPicture = this.style.backgroundImage;
  this.style.borderColor = "red";
  if ((phaseGame === '2') && (this.adress.substr(0, 1) === 'e')) {
    if (this.style.backgroundImage === '') {this.style.backgroundImage = 'url("../img/aim.png")'}
    else if (this.style.backgroundImage === 'url("../img/ship.jpg")') {this.style.backgroundImage = 'url("../img/aimship.jpg")'}
  }
}

// Change back picture (phase 2) and border of buttons
function btnBackPicture() {
  this.style.borderColor = "black";
  this.style.backgroundImage = btnPicture;
}

// message to terminal
function getTerminal(data) {
  document.getElementById('terminal').value += "\n" + data;
  document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
}

function battle(){}

// тест
function test(data) {
  console.log(data);
}