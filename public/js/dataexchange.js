newGame.onclick = function() {
    var socket = io.connect();

    socket.on('hello', createGame);

//  var btn = document.createElement('button');
//  document.getElementById('test').appendChild(btn);

}

click = function() {
    alert('Клик на ' + this.id);
}
btnBorder = function() {
    this.style.borderColor = (this.style.borderColor === "red") ? "black" : "red";
}

function createGame(data) {

    document.getElementById('userName').style.display = "none";
    document.getElementById('gameName').style.display = "none";
    document.getElementById('newGame').style.display = "none";
    document.getElementById('joinGame').style.display = "none";

    console.log(data);
    this.emit('name', {name : userName.value, game : gameName.value});

    console.log('1');

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            let btnField = document.createElement('div');
            btnField.className = 'btn';
            //btnField.onclick = click;
            btnField.addEventListener("click", click);
            btnField.addEventListener("mouseenter", btnBorder);
            btnField.addEventListener("mouseleave", btnBorder);
            btnField.id = 'h' + String(i) + String(j);
            document.getElementById('home').appendChild(btnField);
        }
    }
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            let btnField = document.createElement('div');
            btnField.className = 'btn';
            //btnField.onclick = click;
            btnField.addEventListener("click", click);
            btnField.addEventListener("mouseenter", btnBorder);
            btnField.addEventListener("mouseleave", btnBorder);
            btnField.id = 'e' + String(i) + String(j);
            document.getElementById('enemy').appendChild(btnField);
        }
    }
}