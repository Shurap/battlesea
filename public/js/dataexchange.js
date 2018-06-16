let socket;
let phaseGame;
let name;
let postId;
let btnPicture;

btnNewGame.onclick = function() {
  socket = io.connect();
  socket.on('connClient', createGame);
  socket.on('terminal', getTerminal);
  socket.on('beginGame', beginGame);
  socket.on('battle', battle);
  socket.on('test', test);
}

// тест
function test(data) {
  console.log(data);
}

// Кнопка "Готово"
btnEnter.onclick = function () {
// Сборка массива поля и отправка на сервер
  if ((phaseGame === '1') && (verifArray('ship') === 5)) {
    let array = create2DArray(10, 10);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let index = String(i) + String(j);
        array[i][j] = document.getElementById(index);
      }
    }
    socket.emit('field', {name : userName.value, arr : array});
    getTerminal('> Готово! Ждем другого игрока...');
    document.getElementById('enemy').style.display = "block";
    createBtnField('enemy');
    phaseGame = '2';
  } else if (phaseGame = '2') {
    socket.emit('shoot', postId);
  }
}

// Создание комнаты и подключение игроков
function createGame(data) {
  // скрыть старые, открыть новые элементы
  document.getElementById('start').style.display = "none";
  // передача имени и названия игры на сервер
  this.emit('name', {name : userName.value, game : gameName.value});
  phaseGame = '1';
}

// проверка на количество в кнопках
function verifArray(data) {
  let count = 0;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let index = String(i) + String(j);
      if (document.getElementById(index).content === data) {
        count ++;
      }
    }
  }
  return count;
}

// обработчик нажатия на кнопку поля
function click() {
  //расстановка кораблей
  if (phaseGame === '1') {
    if (verifArray('ship') < 5) {
      this.style.backgroundImage = (this.style.backgroundImage === '') ? 'url("../img/ship.jpg")' : '';
      this.content = (this.content === 'zero') ? 'ship' : 'zero';
    } else {
      this.style.backgroundImage = '';
      this.content = 'zero';
    }
  }
  //установка прицела
  if ((phaseGame === '2') && (this.allowpress === true)) {
    //this.textContent = 'O';
      this.style.backgroundImage = 'url("../img/aimblack.png")';
    postId = this.id;
  }
  btnPicture = this.style.backgroundImage;
}

// создание пустого двумерного массива
function create2DArray(rows, columns) {
  let x = new Array(rows);
  for (let i = 0; i < rows; i++) {
    x[i] = new Array(columns);
  }
  return x;
}

// изменения кнопки поля при наведении
function btnBorder() {
  btnPicture = this.style.backgroundImage;
  this.style.borderColor = "red";
  if ((phaseGame === '2') && (this.allowpress === true)) {
    if (this.style.backgroundImage === '') {this.style.backgroundImage = 'url("../img/aim.png")'}
    else if (this.style.backgroundImage === 'url("../img/ship.jpg")') {this.style.backgroundImage = 'url("../img/aimship.jpg")'}
  }
}

function btnBackPicture() {
  this.style.borderColor = "black";
  this.style.backgroundImage = btnPicture;
}

// сообщение в терминал
function getTerminal(data) {
  document.getElementById('terminal').value += "\n" + data;
  document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
}

// создание поля кнопок
function createBtnField(divId) {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let btnField = document.createElement('div');
      btnField.className = 'btn';
      btnField.addEventListener("click", click);
      btnField.addEventListener("mouseenter", btnBorder);
      btnField.addEventListener("mouseleave", btnBackPicture);
      btnField.id = String(i) + String(j);
      btnField.content = 'zero';
      //btnField.adress = btnField.id;
      btnField.allowpress = (divId === 'enemy') ? true : false;
      document.getElementById(divId).appendChild(btnField);
    }
  }
}

function beginGame(){
  // скрыть старые, открыть новые элементы
  document.getElementById('home').style.display = "block";
  createBtnField('home');
  getTerminal('> Расставьте свои корабли');
}