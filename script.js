// Canvas and context setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
let isRunning = false;
let grid = [];
const CELL_SIZE = 10;
const COLORS = {
    DEAD: getComputedStyle(document.documentElement).getPropertyValue('--cell-dead-color').trim(),
    LEVEL1: getComputedStyle(document.documentElement).getPropertyValue('--cell-level1-color').trim(),
    LEVEL2: getComputedStyle(document.documentElement).getPropertyValue('--cell-level2-color').trim(),
    LEVEL3: getComputedStyle(document.documentElement).getPropertyValue('--cell-level3-color').trim(),
    LEVEL4: getComputedStyle(document.documentElement).getPropertyValue('--cell-level4-color').trim()
};
let lastUpdate = 0;

/**
 * @description Resize the canvas and initialize the grid
 */
function resizeCanvas() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
    initGrid();
}

/**
 * @description Initialize the grid with random cells
 */
function initGrid() {
    const cols = Math.floor(canvas.width / CELL_SIZE);
    const rows = Math.floor(canvas.height / CELL_SIZE);
    grid = Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => Math.random() < 0.3)
    );
}

/**
 * @description Get cell color based on neighbors and alive status
 * @param {number} neighbors - Number of alive neighbors
 * @param {boolean} alive - Cell alive status
 * @returns {string} Cell color
 */
function getCellColor(neighbors, alive) {
    if (!alive) return COLORS.DEAD;
    if (neighbors <= 1) return COLORS.LEVEL1;
    if (neighbors === 2) return COLORS.LEVEL2;
    if (neighbors === 3) return COLORS.LEVEL3;
    return COLORS.LEVEL4;
}

/**
 * @description Draw a single cell
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {boolean} alive - Cell alive status
 */
function drawCell(x, y, alive) {
    const neighbors = countNeighbors(x, y);
    ctx.beginPath();
    ctx.roundRect(
        x * CELL_SIZE, 
        y * CELL_SIZE, 
        CELL_SIZE - 1, 
        CELL_SIZE - 1,
        2
    );
    ctx.fillStyle = getCellColor(neighbors, alive);
    ctx.fill();
}

/**
 * @description Count the number of alive neighbors for a cell
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} Number of alive neighbors
 */
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

/**
 * @description Update the grid based on the Game of Life rules
 */
function updateGrid() {
    grid = grid.map((row, i) =>
        row.map((cell, j) => {
            const neighbors = countNeighbors(i, j);
            return neighbors === 3 || (cell && neighbors === 2);
        })
    );
}

/**
 * @description Draw the entire grid
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.forEach((row, i) =>
        row.forEach((cell, j) => drawCell(j, i, cell))
    );
}

/**
 * @description Main game loop
 * @param {DOMHighResTimeStamp} timestamp - Current timestamp
 */
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

/**
 * @description Toggle the game running state
 */
function toggleGame() {
    isRunning = !isRunning;
    if (isRunning) {
        lastUpdate = performance.now();
        gameLoop(lastUpdate);
    }
}

/**
 * @description Reset the game to the initial state
 */
function resetGame() {
    isRunning = false;
    initGrid();
    draw();
}

// Event listeners
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
draw();
