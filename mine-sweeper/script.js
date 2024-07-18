let control = {
    easy : {
        cols : 8,
        rows : 8,
        nbMines : 10,
        mineGrid : []
    },
    medium : {
        cols : 16,
        rows : 16,
        nbMines : 40,
        mineGrid : []
    },
    hard : {
        cols : 30,
        rows : 16,
        nbMines : 99,
        mineGrid : []
    },
    custom : {
        cols : 8,
        rows : 8,
        nbMines : 10,
        mineGrid : []
    }
};


function deepFreeze(obj) {
    for (const iterator in obj) {
        if(typeof obj[iterator] == 'object') 
            deepFreeze(obj[iterator]);
    }
    Object.freeze(obj);
}
deepFreeze(control);

let difficultyLevel = "easy";
let gameSetting = control;

let gameSet = {
    cols : 8,
    rows : 8,
    nbMines : 10,
    mineGrid : []
    
};
let gameGrid = [];
let gameOver;
let gridElement;
let col;
let row;
let gameStarted;
let nbMines;
let timer;
let score;


const checkBoundries = (x, y) => (x >= 0 && x < gameSet.cols && y >= 0 && y < gameSet.rows);
const zeroPad = (num, places) => String(num).padStart(places, '0');


function setDefault(){
    if(difficultyLevel != 'custom')
        gameSet = gameSetting[difficultyLevel];
    gameGrid = gameSet.mineGrid;
    gameOver = false;
    gameStarted = false;
    nbMines = gameSet.nbMines;
    gridElement = [];
    score = 0;
    
}

function renderGrid(){
    const gameContainer = document.getElementById('game');
    let bufferArray = [];
    gameContainer.innerHTML = "";
    gameContainer.style.gridTemplateColumns = `repeat(${gameSet.cols}, auto)`;
    gameContainer.style.gridTemplateRows = `repeat(${gameSet.rows}, auto)`;
    for (let i in gameGrid){
        bufferArray = [];
        for (let j in gameGrid[i]){
            let block = document.createElement('button');
            block.classList.add('grid');
            block.classList.add('gridBlock');
            block.style.gridColumn = i + 1;
            block.style.gridRow = j + 1;
            block.dataset.x = i;
            block.dataset.y = j;
            block.dataset.value = gameGrid[i][j];
            block.onclick = () => {
                startTimer();
                gameStarted = true;
                reveal(block);
                checkMines();
            };
            
            bufferArray.push(block);
            gameContainer.appendChild(block);
        }
        gridElement.push(bufferArray);

    }
}

function start(){
    clearInterval(timer);
    document.getElementById('timer').innerHTML = "000";
    deletePrevGame();
    setDefault();
    generateGame(gameSet.rows, gameSet.cols);
    renderGrid();
    checkMines();
}


document.getElementById('restart-button').addEventListener('click', () => start());


function reveal(block){
    
    if(block.dataset.value == 0){
        revealAdjacent(block);
    }
    if(block.dataset.value == 'M'){
        block.classList.add('gridMine');
        disableRevealMines();
        block.style.backgroundColor = 'red';
    }else{
        showNumber(block);
    }
    
}

function showNumber(block){
    switch(block.dataset.value){
        case '1':
            block.classList.add('nb1');
            break;
        case '2':
            block.classList.add('nb2');
            break;
        case '3':
            block.classList.add('nb3');
            break;
        case '4':
            block.classList.add('nb4');
            break;
        case '5':
            block.classList.add('nb5');
            break;
        case '6':
            block.classList.add('nb6');
            break;
        case '7':
            block.classList.add('nb7');
            break;
        case '8':
            block.classList.add('nb8');
            break;
    }
    block.classList.add('gridOpen');
    if(block.dataset.value != 0)
        block.innerHTML = block.dataset.value;
    block.classList.remove('gridBlock');
}

function revealAdjacent(currBlock){
    const x = parseInt(currBlock.dataset.x);
    const y = parseInt(currBlock.dataset.y);
    let adjacent = [] ;
    for (let i in gameGrid){
        let bufferArray =[];
        for (let j in gameGrid[i]){
            bufferArray.push(0);
        }
        adjacent.push(bufferArray);
    }


    function fillToReveal(x, y){
        if(!checkBoundries(x, y) || adjacent[x][y] == 1 || gridElement[x][y].dataset.value == 'M') return;
        if(gridElement[x][y].classList.contains('gridOpen')) return;
        if(gridElement[x][y].dataset.value != '0'){
            showNumber(gridElement[x][y]);
            return;
        }
        adjacent[x][y] = 1;
        fillToReveal(x, y - 1);
        fillToReveal(x, y + 1);
        fillToReveal(x - 1, y);
        fillToReveal(x + 1, y);
        fillToReveal(x - 1, y - 1);
        fillToReveal(x - 1, y + 1);
        fillToReveal(x + 1, y - 1);
        fillToReveal(x + 1, y + 1);
    }
    fillToReveal(x, y);

    for (let i in adjacent){
        for (let j in adjacent[i]){
            if(adjacent[i][j] == 1){
                showNumber(gridElement[i][j]);
            }
        }
    }
}

function disableRevealMines(){
    document.querySelectorAll('.gridBlock').forEach((block) => {
        block.classList.remove('gridBlock');
        block.disabled = true;
        if(block.dataset.value == 'M')
            block.classList.add('gridMine');
    });

    gameOver = true;
}

function deletePrevGame(){
    document.querySelectorAll('.grid').forEach((block) => block.parentNode.removeChild(block));
}

function startTimer(){
    if(gameStarted) return;
    timer = setInterval(() => {
        if(gameOver) {
            clearInterval(timer);
            return;
        }
        if(score < 999) score++;
        else {
            clearInterval(timer);
            return;
        }
        
        document.getElementById('timer').innerHTML = zeroPad(score,3);
    },1000);
}

function checkMines(){
    const mines = document.querySelectorAll('.gridBlock').length;
    const minesLeft = gameSet.nbMines;
    document.getElementById('mines-left').innerHTML = zeroPad(minesLeft,3);
    if(mines <= nbMines){
        disableRevealMines();
    }
}

function generateGame(rows, cols){
    const grid = [];
    for (let i=0; i<cols; i++) {
        let bufferArray = [];
        for (let j=0; j<rows; j++){
            bufferArray.push(0);
        }
        grid.push(bufferArray);
    }

    let mines = gameSet.nbMines;
    while(mines > 0) {
        let x = parseInt(Math.random()*1000 % cols + 1) - 1;
        let y = parseInt(Math.random()*1000 % rows + 1) - 1;
        if(grid[x][y] == 'M') continue;
        mines--;
        grid[x][y] = 'M';
        // add values to around the mines
        if(checkBoundries(x, y - 1) && grid[x][y - 1] != 'M') grid[x][y - 1] += 1;
        if(checkBoundries(x, y + 1) && grid[x][y + 1] != 'M') grid[x][y + 1] += 1;
        if(checkBoundries(x - 1, y) && grid[x - 1][y] != 'M') grid[x - 1][y] += 1;
        if(checkBoundries(x + 1, y) && grid[x + 1][y] != 'M') grid[x + 1][y] += 1;
        if(checkBoundries(x - 1, y - 1) && grid[x - 1][y - 1] != 'M') grid[x - 1][y - 1] += 1;
        if(checkBoundries(x - 1, y + 1) && grid[x - 1][y + 1] != 'M') grid[x - 1][y + 1] += 1;
        if(checkBoundries(x + 1, y - 1) && grid[x + 1][y - 1] != 'M') grid[x + 1][y - 1] += 1;
        if(checkBoundries(x + 1, y + 1) && grid[x + 1][y + 1] != 'M') grid[x + 1][y + 1] += 1;
        
    }
    // console.log("Game Layout(transpozed):\n");
    // console.log(grid);
    gameGrid = grid;
}

document.getElementById('start-button').addEventListener('click', () => {
    const prevDifficulty = difficultyLevel;
    difficultyLevel = document.getElementById('difficultySelect').value;
    if(difficultyLevel == 'default') difficultyLevel = prevDifficulty;
    if(difficultyLevel == 'custom'){
        startCustom();
    }else{
        start();
    }

});

function startCustom(){
    let popUp = document.createElement('div');
    let blur = document.createElement('div');
    popUp.classList.add('customPopUp');
    popUp.innerHTML = `
        <form action="getCustom" id="custom-form">
            <div>
                <label for="custom-cols">Number of Columns:</label>
                <input type="number" name="custom-cols" id="custom-cols" min="8" max="50" step="1" placeholder="8">
            </div>
            <div>
                <label for="custom-rows">Number of Rows:</label>
                <input type="number" name="custom-rows" id="custom-rows" min="8" max="24" step="1" placeholder="8">
            </div>
            <div>
                <label for="custom-mines">Number of Mines:</label>
                <input type="number" name="custom-mines" id="custom-mines" min="10" max="300" step="1" placeholder="10">
            </div>
            <button type="submit" id="custom-submit">Play</button>
        </form>
    `;
    popUp.style.animation = 'customPopUp-animation 0.5s forwards ease-in-out';
    popUp.style.transform = 'translateY(200px)';

    blur.classList.add('blur-background');
    document.body.appendChild(blur);
    document.body.appendChild(popUp);

    
    document.getElementById('custom-form').addEventListener('submit', (event) => {
        event.preventDefault();
        gameSet = {
            cols : 8,
            rows : 8,
            nbMines : 10,
            mineGrid : []
            
        };

        const formData = new FormData(event.target);
        const formObject = Object.fromEntries(formData.entries());

        gameSet.cols = parseInt(formObject['custom-cols']);
        gameSet.rows = parseInt(formObject['custom-rows']);
        gameSet.nbMines = parseInt(formObject['custom-mines']);

        blur.remove();
        popUp.style.animation = 'customPopUp-animation-reverse 0.5s forwards ease-in-out';
        setTimeout(() => popUp.remove(), 1000);
        start();
    });
};
