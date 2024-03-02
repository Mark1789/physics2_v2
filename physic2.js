let area = document.querySelector('.area');
let hero = document.querySelector('.hero');
let aim = document.querySelector('.aim');
let circle = document.querySelector('.circle');
let stick = document.querySelector('.stick');
let shot = document.querySelector('.shot');
hero.style.left = area.offsetWidth/2 - hero.offsetWidth/2 + 'px';
hero.style.top = area.offsetHeight/2 - hero.offsetHeight/2 + 'px';
let areaCoords = area.getBoundingClientRect();
let areaXcenterWindow = areaCoords.x + areaCoords.width/2;
let areaYcenterWindow = areaCoords.y + areaCoords.height/2;
let circleCoords = circle.getBoundingClientRect();
let circleXcenterWindow = circleCoords.x + circleCoords.width/2;
let circleYcenterWindow = circleCoords.y + circleCoords.height/2;
let diagonalLength = 0;
let speedHero = 1.7;
let speedAutoMove = speedHero / 4;
let speedProcess = speedHero * 6.2;
let dx;
let dy;

let heroObj = {
  heroX: area.offsetWidth/2 - hero.offsetWidth/2,
  heroY: area.offsetHeight/2 - hero.offsetHeight/2,
  rotate: 0,
  move(x, y) {
    if (this.heroX + hero.offsetWidth > areaCoords.right) {
      this.heroX = areaCoords.right - hero.offsetWidth;
    } 
    if (this.heroX - areaCoords.left < areaCoords.left) {
      this.heroX = 0;
    }
    if (this.heroY - areaCoords.top < areaCoords.top) {
      this.heroY = 0;
    }
    if (this.heroY + hero.offsetHeight > areaCoords.bottom) {
      this.heroY = areaCoords.bottom - hero.offsetHeight;
    } 
    
    this.heroX += x * speedHero;
    this.heroY += y * speedHero;
    
    hero.style.left = this.heroX + 'px';
    hero.style.top = this.heroY + 'px';
  },
  rotateAngle(angle) {
    this.rotate += angle - this.rotate;
    hero.style.transform = `rotate(${this.rotate}deg)`;
  },
}

// получаем длинну диагонали от центра окружности стика до предоставленных координат
function calculateDiagonal (x, y) {
  let a = Math.abs(x - circleXcenterWindow);
  let b = Math.abs(y - circleYcenterWindow);
  diagonalLength = Math.sqrt(a*a + b*b);
}

// используется для вычисления направления объекта относительно какого-либо центра 
function fromCenterMove (x, y, centerX, centerY) {
  dx = x - centerX;
  dy = y - centerY;
  
  let catangens = Math.atan2(dy, dx);
  let heroDx = Math.cos(catangens) * speedAutoMove;
  let heroDy = Math.sin(catangens) * speedAutoMove;
  
  return [heroDx, heroDy, catangens];
}

// ввсчитываем градус поворота стика и передаем его герою
function calculateAngleHero (catangens) {
  let angle = (catangens * 180) / Math.PI;
  if (angle < 0) angle += 360;
  
  heroObj.rotateAngle(angle);
}

// заданм расположение стика
function calculateStickMove (x, y, catangens) {
  let dr = circle.offsetWidth/2 - stick.offsetWidth/2;
  if (diagonalLength < 25) {
    // calculate new coords stick
    dx = x - circleCoords.x - stick.offsetWidth / 2;
    dy = y - circleCoords.y - stick.offsetHeight / 2;
  } else {
    dx = Math.cos(catangens)*dr + dr;
    dy = Math.sin(catangens)*dr + dr;
  } 
  
  stick.style.left = dx + 'px';
  stick.style.top = dy + 'px';
}

// создаем пулю
function createBullet () {
  bullet = document.createElement('span');
  bullet.classList.add('bullet');
  bullet.style.transform = `rotate(${heroObj.rotate}deg)`;
  bullet.style.left = heroObj.heroX + 10 + 'px';
  bullet.style.top = heroObj.heroY + 10 + 'px';
  area.insertAdjacentElement('beforeend', bullet);
  bulletX = heroObj.heroX + 10;
  bulletY = heroObj.heroY + 10;
}

// переменные пули(сама пуля, её x и y, проверка на пулю в настоящий момент на арене)
let bullet;
let bulletX;
let bulletY;
let bulletCheck = false;

// полет пули, столкновение с ареной и скорость
function skyBullet (x, y) {
 if (bulletX > areaCoords.right) {
      bulletX = areaCoords.right;
      bulletCheck = false;
    } 
    if (bulletX < areaCoords.left) {
      bulletX = 0;
      bulletCheck = false;
    }
    if (bulletY < areaCoords.top) {
      bulletY = 0;
      bulletCheck = false;
    }
    if (bulletY > areaCoords.bottom) {
      bulletY = areaCoords.bottom;
      bulletCheck = false;
    } 
    
    bulletX += x*7;
    bulletY += y*7;
    
    bullet.style.left = bulletX + 'px';
    bullet.style.top = bulletY + 'px';
}

// координаты на момент выстрела, чтобы пули не меняла траекторию ввиду даижения героя
let bulletDirectoryX;
let bulletDirectoryY;

// процесс
let process;
process = setInterval(() => {
  // если стик упирается в окружность, то включаем автоход герою
  if (diagonalLength >= 25) {
    let stickCoords = stick.getBoundingClientRect();
    
    [heroDx, heroDy] = fromCenterMove (stickCoords.x + stickCoords.width/2, stickCoords.y + stickCoords.height/2, circleXcenterWindow, circleYcenterWindow);
    
    heroObj.move(heroDx, heroDy);
  }
  // полет пули
  if (bulletCheck) {
     skyBullet (bulletDirectoryX, bulletDirectoryY);
  }
}, speedProcess)

// events listener
  stick.addEventListener('touchmove', (event) => {
    event.preventDefault();
    let touch = event.targetTouches[0];
   
    [heroDx, heroDy, catangens] = fromCenterMove (touch.clientX, touch.clientY, circleXcenterWindow, circleYcenterWindow);
    ////////////
    calculateDiagonal (touch.clientX, touch.clientY)
    calculateAngleHero (catangens);
    calculateStickMove (touch.clientX, touch.clientY, catangens);
    ////////////
    if (diagonalLength < 50) {
      heroObj.move(heroDx, heroDy);
    }
  })

stick.addEventListener('touchend', (event) => {
    event.preventDefault();
    stick.style.left = circle.offsetWidth/2 - stick.offsetWidth/2 + 'px';
    stick.style.top = circle.offsetHeight/2 - stick.offsetHeight/2 + 'px';
    
    diagonalLength = 0;
})

shot.addEventListener('touchstart', (event) => {
  event.preventDefault();
  
  if (!bulletCheck) {
  // получаем метрики прицела, вычисляем координаты траектории для пули
  let aimCoords = aim.getBoundingClientRect();
     [bulletDx, bulletDy] = fromCenterMove (aimCoords.x, aimCoords.y, heroObj.heroX+10, heroObj.heroY+10);
  
  // сохраняем полученные координаты траектории пули в отдельных переменных для того, чтобы траектория не менялась при перемещении героя
  bulletDirectoryX = bulletDx;
  bulletDirectoryY = bulletDy;
  
  bulletCheck = true;
  createBullet();
  }
})
/*
area.addEventListener('pointerdown', (event) =>  {
  let el = document.elementFromPoint(event.x, event.y);
  if (el.closest(".enemy") || el.closest(".hero")) el.remove();
  event.preventDefault();
});
*/
