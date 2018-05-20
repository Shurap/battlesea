newGame.onclick = function() {
  var socket = io.connect();

  socket.on('hello', createGame);

//  var btn = document.createElement('button');
//  document.getElementById('test').appendChild(btn);

}


function createGame(data) {

  console.log(data);
  this.emit('name', {name : userName.value, game : gameName.value});

  //document.location.href = '/html/game.html';
  window.location.href = '/html/game.html';

  console.log('1');

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let btnField = document.createElement('div');
      btnField.id = String(i) + String(j);
      btnField.className = 'btn';
      //btnField.onclick = click;
      btnField.addEventListener("click", click);
      btnField.addEventListener("mouseenter", btnBorder);
      btnField.addEventListener("mouseleave", btnBorder);
      document.getElementById('field').appendChild(btnField);
    }
  }

}