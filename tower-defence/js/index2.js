const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 600;

// global variables
const cellSize = 100;
const cellGap = 2;
let numberOfResources = 300;
let enemiesInterval = 700;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];

// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;
});

// game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid(){
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid(){
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}
// projectiles
class Projectile {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++){
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice(i, 1);
            i--;
        }
    }
}

// defenders
const defender1 = new Image();
defender1.src = "defender1.png";
class Defender {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootnOW = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0; 
        this.spriteWidth = 102;
        this.spriteHeight = 90;
        this.minFrame = 0;
        this.maxFrame = 6;
    
    }
    draw(){
        //ctx.fillStyle = 'blue';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        ctx.drawImage(defender1,this.frameX * this.spriteWidth, 0 , this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height )

    }
    update(){
        if (frame % 25 == 0 ){
            if (this.frameX < this.maxFrame) this.frameX ++
            else this.frameX = this.minFrame;
            if (this.frameX == 1) this.shootNow = true ;
         }  
        

        if (this.shooting && this.shootNow){
            //this.timer++;
           // if (this.timer % 100 === 0){
                projectiles.push(new Projectile(this.x + 70, this.y + 50));
                this.shootNow = false;
        }
    }
}
canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x  - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < defenders.length; i++){
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost){
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    }
});
function handleDefenders(){
    for (let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1){
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++){
            if (defenders[i] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 1;
            }
            if (defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}
const card1 = {
    x: 10,
    y:10,
    width: 70,
    height: 85
}
const card2 = {
    x: 90,
    y:10,
    width: 70,
    height: 85
}
function chooseDefender(){
    ctx.lineWidth = 1 ;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(card1.x,card1.y,card1.width,card1.height)
    ctx.drawImage(defender1, 0, 0, 102, 90, 20, 30, 108/2, 90/2);   
    ctx.fillRect(card2.x,card2.y,card2.width,card2.height)
}
// floating messages 

// enemies
const alienTypes = [];
const alien1 = new Image();
alien1.src ="alien1.png";
alienTypes.push(alien1);
const alien2 = new Image();
alien2.src = "alien2.png"
alienTypes.push(alien2);

class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health; 
        this.alienTypes = alienTypes[Math.floor(Math.random()* alienTypes.length)];
        this.frameX = 0 ;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 2;
        this.spriteWidth = 33;
        this.spriteHeight = 48; 

    }
    update(){
        this.x -= this.movement;
        if (frame % 22 ===0){
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame; 
        }
        
    }
    draw(){
       // ctx.fillStyle = 'red';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30); 
        ctx.drawImage(this.alienTypes, this.frameX * this.spriteWidth, 0 , this.spriteWidth, this.spriteHeight,this.x, this.y, this.width, this.height);
    }
}
function handleEnemies(){
    for (let i = 0; i < enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0){
            gameOver = true;
        }
        if (enemies[i].health <= 0){
            let gainedResources = enemies[i].maxHealth/10;
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--; 
          }
    }
    if (frame % enemiesInterval === 0 && score < winningScore){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 120) enemiesInterval -= 50;
    }
}

// resources
const amounts = [20, 30, 40];
class Resource {
    constructor(){
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw(){
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(this.amount, this.x + 15, this.y + 25);
    }
}
function handleResources(){
    if (frame % 500 === 0 && score < winningScore){
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++){
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            numberOfResources += resources[i].amount;
            resources.splice(i, 1);
            i--;
        }
    }
}

// utilities
function handleGameStatus(){
    ctx.fillStyle = 'gold';
    ctx.font = '30px Orbitron';
    ctx.fillText('Score: ' + score, 850, 40);
    ctx.fillText('Energy: ' + numberOfResources, 850, 80);
    if (gameOver){
        ctx.fillStyle = 'black';
        ctx.font = '90px Orbitron';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score >= winningScore && enemies.length === 0){
        ctx.fillStyle = 'black';
        ctx.font = '60px Orbitron';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('You win with ' + score + ' points!', 134, 340);
    }
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0,controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    chooseDefender()
    handleGameStatus();
    frame++;
    if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second){
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    };
};

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
})