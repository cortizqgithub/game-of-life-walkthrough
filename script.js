// Canvas and context setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
let isRunning = false;
let grid = [];
const cellSize = 10;
const colors = {
    dead: getComputedStyle(document.documentElement).getPropertyValue('--cell-dead-color').trim(),
    level1: getComputedStyle(document.documentElement).getPropertyValue('--cell-level1-color').trim(),
    level2: getComputedStyle(document.documentElement).getPropertyValue('--cell-level2-color').trim(),
    level3: getComputedStyle(document.documentElement).getPropertyValue('--cell-level3-color').trim(),
    level4: getComputedStyle(document.documentElement).getPropertyValue('--cell-level4-color').trim()
};
let lastUpdate = 0;

// Initialize canvas size and grid
function resizeCanvas() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
    initGrid();
}

// Initialize grid with random cells
function initGrid() {
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);
    grid = Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => Math.random() < 0.3)
    );
}

// Get cell color based on neighbors and alive status
function getCellColor(neighbors, alive) {
    if (!alive) return colors.dead;
    if (neighbors <= 1) return colors.level1;
    if (neighbors === 2) return colors.level2;
    if (neighbors === 3) return colors.level3;
    return colors.level4;
}

// Draw a single cell
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

// Count the number of alive neighbors for a cell
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

// Update the grid based on the Game of Life rules
function updateGrid() {
    grid = grid.map((row, i) =>
        row.map((cell, j) => {
            const neighbors = countNeighbors(i, j);
            return neighbors === 3 || (cell && neighbors === 2);
        })
    );
}

// Draw the entire grid
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.forEach((row, i) =>
        row.forEach((cell, j) => drawCell(j, i, cell))
    );
}

// Main game loop
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

// Toggle the game running state
function toggleGame() {
    isRunning = !isRunning;
    if (isRunning) {
        lastUpdate = performance.now();
        gameLoop(lastUpdate);
    }
}

// Reset the game to the initial state
function resetGame() {
    isRunning = false;
    initGrid();
    draw();
}

// Event listeners
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
draw();
