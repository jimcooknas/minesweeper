// Daniel Shiffman
// The Coding Train
// Minesweeper
// https://thecodingtrain.com/challenges/71-minesweeper
// Video: https://youtu.be/LFU5ZlrR21E

// ES6 version: https://editor.p5js.org/codingtrain/sketches/Xap-KQuO_+

//Extended by Cooknas: http://www.cooknas.com/codingtrain/minesweeper/index.html 

//canvas
var canvasSize = 601;
var canvas;
//Elements
var widthValEl;
var bombsValEl;
var widthRangeEl;
var bombsRangeEl;
var colsrowsEl;
var resultEl;
var bombsLeftEl;
var winlooseEl;
var winloosePanEl;
var svgcupEl;

function make2DArray(cols, rows) {
    var arr = new Array(cols);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

// explosion
let explosionCount = 8;
let explosion = new Array(explosionCount);
let exploding = false;
let explosionIndex = 0;
var explosionGrid;
var explosionWidth = 200;

//grid, bombs and cells
var grid;
var cols;
var rows;
var w = 30;
var totalBombs = 20;
var allRevealed = false;
var winORloose = 0;
//timer
var timerValue = 120;
var mainTimerValue = 120;
var timerEl;
var timer;
const inputStep = 1;
var swalIsOn = false;


function newGame(){
    initGame();
}
  
function setup() {
    canvas = createCanvas(canvasSize, canvasSize);
    //remove contextmenu of browser when clicking right-mouse button
    canvas.elt.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.parent(document.getElementById("canvasCell"));
    //define elements
    widthValEl = document.getElementById("widthValue");
    widthRangeEl = document.getElementById("rangeWidth");
    colsrowsEl = document.getElementById("colsrows");
    bombsValEl = document.getElementById("bombsValue");
    bombsRangeEl = document.getElementById("rangeBombs");
    resultEl = document.getElementById("result");
    bombsLeftEl = document.getElementById("bombsleft");
    winlooseEl = document.getElementById("winloose");
    winloosePanEl = document.getElementById("winloosePan");
    timerEl = document.getElementById("timer");
    svgcupEl = document.getElementById("svgcup");
    //events listeners
    widthRangeEl.addEventListener("input", function(){
        widthValEl.textContent = widthRangeEl.value.toString();
        var newW = floor(width/widthRangeEl.value);
        colsrowsEl.textContent = newW + " x " + newW;
    });
    bombsRangeEl.addEventListener("input", function(){
        bombsValEl.textContent = bombsRangeEl.value.toString();
    });
    //initialize game
    initGame();
}

function preload() {
    for (let i = 0; i < explosion.length; i++)
        explosion[i] = loadImage("data/explode" + i + ".png");
}

function initGame(){
    noLoop();
    allRevealed = false;
    w = parseInt(widthValEl.textContent);
    totalBombs = parseInt(bombsValEl.textContent);
    bombsLeftEl.textContent = totalBombs.toString();
    winORloose = 0;
    exploding = false;
    winlooseEl.style.display="";
    timerValue = mainTimerValue;
    timerEl.textContent = calcTime();
    //winlooseEl.style.visibility = "hidden";
    cols = floor(width / w);
    rows = floor(height / w);
    grid = make2DArray(cols, rows);
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j] = new Cell(i, j, w);
        }
    }
    // Pick totalBombs spots ...
    var options = [];
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            options.push([i, j]);
        }
    }
    // ... and add bombs to the grid
    for (var n = 0; n < totalBombs; n++) {
        var index = floor(random(options.length));
        var choice = options[index];
        var i = choice[0];
        var j = choice[1];
        // Deletes that spot so it's no longer an option
        options.splice(index, 1);
        grid[i][j].bomb = true;
    }
  
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].countBombs();
        }
    }
    resultEl.style.color = "black";
    resultEl.textContent="...";
    swalIsOn=false;
    if(timer!=undefined)clearInterval(timer);
    timer = setInterval(timerTick, 1000);
    loop();
}

function timerTick(){
    if(timerValue > 0){
        timerValue--;
    }else{
        gameOver(-2);
    }
}

function setTimer(){
    clearInterval(timer);
    swalIsOn = true;
    getTimer();
}

function getTimer(){
    var inputValue = mainTimerValue;
    Swal.fire({
        title: 'Input Time',
        html: `
            <input
                type="number"
                value="${inputValue}"
                step="${inputStep}"
                class="swal2-input"
                id="range-value" style="margin-right:5px;margin-left:-20px;"><span>seconds</span>`,
        input: 'range',
        inputValue,
        inputAttributes: {
            min: '30',
            max: '600',
            step: inputStep.toString(),
        },
        buttonsStyling: true,
        showCancelButton: true,
        customClass: {
            confirmButton: 'btn btn-primary btn-lg mr-2',
            cancelButton: 'btn btn-danger btn-lg',
        },
        width:"350px",
        footer:"Change timer duration either by scrolling the <b>slider thumb</b> or by entering a new value inside the <b>text-box</b>. Valid values range between 30 and 600 seconds",
        didOpen: () => {
            const inputRange = Swal.getInput();
            const inputNumber = Swal.getPopup().querySelector('#range-value');
            Swal.getContainer().style.borderRadius="8px";
            inputNumber.style.width="100px";
            inputNumber.style.fontSize = "18px";
            inputNumber.style.fontWeight = "600";
            inputRange.style.height="10px";
            inputRange.style.width = "100%";
            Swal.getActions().style.width="100%";
            Swal.getActions().style.margin = "20px 0px 0px -30px";
            // remove default output
            Swal.getPopup().querySelector('output').style.display = 'none';
            
            // sync input[type=number] with input[type=range]
            inputRange.addEventListener('input', () => {
                inputNumber.value = inputRange.value;
            })
            // sync input[type=range] with input[type=number]
            inputNumber.addEventListener('change', () => {
                inputRange.value = inputNumber.value;
            })
        },
    }).then((result)=>{
        if(result.value!=undefined){
            timerValue = result.value;
            mainTimerValue = result.value;
            console.log("timer value = "+mainTimerValue);
            swalIsOn = false;
            timer = setInterval(timerTick, 1000);
        }
    });
}

function gameWin(){
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].revealed = true;
        }
    }
    resultEl.style.color = "green";
    resultEl.textContent="WINNER";
    winORloose = 1;
    clearInterval(timer);
}
  
function gameOver(what) {
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].revealed = true;
        }
    }
    allRevealed=true;
    resultEl.style.color = "red";
    resultEl.textContent="You LOOSE";
    winORloose = what;
    clearInterval(timer);
}
  
function mousePressed() {
    if(swalIsOn)return;
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            if (grid[i][j].contains(mouseX, mouseY)) {
                if(mouseButton==LEFT){
                    grid[i][j].reveal();
                    grid[i][j].flag = false;
                    bombsLeftEl.textContent = (totalBombs-countFlags()).toString();
                    if (grid[i][j].bomb) {
                        gameOver(-1);
                        explosionGrid = grid[i][j];
                        exploding = true;
                        explosionIndex = 0;
                        return;
                    }
                }else if(mouseButton==RIGHT){
                    grid[i][j].flag = true;
                    var counter1 = 0;
                    for(var k=0;k<cols;k++)
                        for(var l=0;l<rows;l++)
                            if(grid[k][l].flag)
                                counter1++;
                    bombsLeftEl.textContent = (totalBombs-counter1).toString();
                }
            }
        }
    }
}

function countFlags(){
    var totFlags=0;
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            if(grid[i][j].flag)totFlags++;
        }
    }
    return totFlags;
}

function calcTime(){
    var ret="";
    var m = floor(timerValue / 60);
    var s = timerValue % 60;
    if (s >= 10) {
        ret = m + ":" + s;
    }
    if (s < 10) {
        ret = m + ':0' + s;
    }
    if (s == 0) {
        ret = m + ":00";
    }
    return ret;
}
  
function draw() {
    background(255);
    timerEl.textContent = calcTime();
    var cells = cols * rows;
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].show();
            if(!allRevealed)
                if(grid[i][j].revealed || grid[i][j].flag)
                    cells--;
        }
    }
    if(cells==0) gameWin();
    if(exploding == true){
        if (explosionIndex < explosion.length){
            image(explosion[explosionIndex], explosionGrid.x - explosionWidth / 2, explosionGrid.y - explosionWidth / 2);
            if (frameCount % 10 == 0) explosionIndex++;
        }else{
            if(winORloose == -1){
                noLoop();
                winlooseEl.style.display="flex";
                winlooseEl.style.backgroundColor="#ff0000cc";
                winloosePanEl.style.color = "red";
                svgcupEl.style.display = "none";
                svgcupEl.classList.remove("vis");
                winloosePanEl.innerHTML="You L O O S E  <i class='fa fa-thumbs-down' style='font-size:64px;'></i>";
                console.log("You L O O S E");
                //return;
            }
        }
    }
    if(winORloose == -2){
        noLoop();
        winlooseEl.style.display="flex";
        winlooseEl.style.backgroundColor="#ff0000cc";
        winloosePanEl.style.color = "red";
        svgcupEl.style.display = "none";
        svgcupEl.classList.remove("vis");
        winloosePanEl.innerHTML="You LOOSE by time  <i class='fa fa-thumbs-down' style='font-size:64px;'></i>";
        console.log("You L O O S E by time");
    }
    if(winORloose == 1){
        winlooseEl.style.display="flex";
        winlooseEl.style.backgroundColor="#00ff00cc";
        noLoop();
        winloosePanEl.style.color = "green";
        svgcupEl.style.display = "flex";
        svgcupEl.classList.add("vis");
        winloosePanEl.innerHTML="W I N N E R  <i class='fa fa-thumbs-up' style='font-size:64px;'></i>";
        console.log("W I N N E R");
        
        //return;
    }
        
}