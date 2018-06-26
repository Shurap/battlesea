exports.numberShips = function(coordX, coordY, target){
  let count = 0;
//vertical
  for (let i = 0; i < 10; i++) {
    if (i !== +coordX) {
      if ((target[i][coordY].content === 'ship') || (target[i][coordY].content === 'wreck')) count++;
    }
  }
//horizontal
  for (let i = 0; i < 10; i++) {
    if (i !== +coordY) {
      if ((target[coordX][i].content === 'ship') || (target[coordX][i].content === 'wreck')) count++;
    }
  }
  let i = coordX;
  let j = coordY;
  while ((i < 9) && (j < 9)) {
    i++;
    j++;
    if ((target[i][j].content === 'ship') || (target[i][j].content === 'wreck')) count++;
  }
  i = coordX;
  j = coordY;
  while ((i > 0) && (j > 0)) {
    i--;
    j--;
    if ((target[i][j].content === 'ship') || (target[i][j].content === 'wreck')) count++;
  }
  i = coordX;
  j = coordY;
  while ((i < 9) && (j > 0)) {
    i++;
    j--;
    if ((target[i][j].content === 'ship') || (target[i][j].content === 'wreck')) count++;
  }
  i = coordX;
  j = coordY;
  while ((i > 0) && (j < 9)) {
    i--;
    j++;
    if ((target[i][j].content === 'ship') || (target[i][j].content === 'wreck')) count++;
  }
  return count;
};