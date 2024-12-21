const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let isRunning = false;
let grid = [];
const cellSize = 10;
const colors = {
    dead: '#ffffff',
    level1: '#9be9a8',
    level2: '#40c463',
    level3: '#30a14e',
    level4: '#216e39'
};
let lastUpdate = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
    initGrid();
}

function initGrid() {
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);
    grid = Array(rows).fill().map(() => 
        Array(cols).fill().map(() => Math.random() < 0.3)
    );
}

function getCellColor(neighbors, alive) {
    if (!alive) return colors.dead;
    if (neighbors <= 1) return colors.level1;
    if (neighbors === 2) return colors.level2;
    if (neighbors === 3) return colors.level3;
    return colors.level4;
}

function drawCell(x, y, alive) {
    const neighbors = countNeighbors(x, y);
    ctx.beginPath();
    ctx.roundRect(
        x * cellSize, 
        y * cellSize, 
        cellSize - 1, 
        cellSize - 1,
        2
    );
    ctx.fillStyle = getCellColor(neighbors, alive);
    ctx.fill();
}

function countNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const row = (x + i + grid.length) % grid.length;
            const col = (y + j + grid[0].length) % grid[0].length;
            if (grid[row][col]) count++;
        }
    }
    return count;
}

function updateGrid() {
    const newGrid = grid.map((row, i) =>
        row.map((cell, j) => {
            const neighbors = countNeighbors(i, j);
            return neighbors === 3 || (cell && neighbors === 2);
        })
    );
    grid = newGrid;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.forEach((row, i) =>
        row.forEach((cell, j) => drawCell(j, i, cell))
    );
}

function gameLoop(timestamp) {
    if (isRunning) {
        if (timestamp - lastUpdate >= 500) {  // 500ms = 0.5s
            updateGrid();
            draw();
            lastUpdate = timestamp;
        }
        requestAnimationFrame(gameLoop);
    }
}

function toggleGame() {
    isRunning = !isRunning;
    if (isRunning) {
        lastUpdate = performance.now();
        gameLoop(lastUpdate);
    }
}

function resetGame() {
    isRunning = false;
    initGrid();
    draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
draw();
