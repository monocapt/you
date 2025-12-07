// --- Game Configuration ---
const BOARD_SIZE = 20; 
const GAME_SPEED = 200; 
const WIN_SCORE = 5; 
const board = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score-display');
const startButton = document.getElementById('start-button');
const messageArea = document.getElementById('message-area');
const nextButton = document.getElementById('next-button');
const meteorContainer = document.getElementById('meteor-shower-container');

// --- Game State ---
let snake = [{ x: 10, y: 10 }]; 
let food = {};
let dx = 1; 
let dy = 0; 
let score = 0;
let gameInterval;
let isGameOver = false;

// --- Touch State for Swipe Detection ---
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30; // Minimum pixel difference to register a swipe


// --- Background Animation Function ---
function generateMeteors() {
    if (!meteorContainer) return;

    const NUM_METEORS = 30;

    for (let i = 0; i < NUM_METEORS; i++) {
        const meteor = document.createElement('div');
        meteor.classList.add('meteor');

        // Random position and timing for the shower effect
        const startX = Math.random() * 100 + 100;
        const startY = Math.random() * 100 + 10; 
        const duration = Math.random() * 5 + 3;
        const delay = Math.random() * 6;

        meteor.style.top = `${startY}vh`;
        meteor.style.left = `${startX}vw`;
        meteor.style.animationDuration = `${duration}s`;
        meteor.style.animationDelay = `${delay}s`;

        meteorContainer.appendChild(meteor);
    }
}


// --- Birthday Screen Function ---
function showBirthdayNote() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('birthday-screen').classList.add('active'); 
}

// --- Core Game Logic ---

function startGame() {
    // Reset state
    snake = [{ x: 10, y: 10 }];
    dx = 1; 
    dy = 0;
    score = 0;
    isGameOver = false;
    scoreDisplay.textContent = `Score: 0`;
    messageArea.textContent = `Reach Score ${WIN_SCORE} to WIN!`;
    startButton.style.display = 'none';
    nextButton.style.display = 'none';
    
    // Start game loop
    placeFood();
    renderBoard();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(moveSnake, GAME_SPEED);
}

function renderBoard() {
    board.innerHTML = ''; 

    // Render snake
    snake.forEach(segment => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridArea = `${segment.y} / ${segment.x}`; 
        snakeElement.classList.add('snake');
        board.appendChild(snakeElement);
    });

    // Render food
    const foodElement = document.createElement('div');
    foodElement.style.gridArea = `${food.y} / ${food.x}`;
    foodElement.classList.add('food');
    board.appendChild(foodElement);
}

function placeFood() {
    let newFoodPosition;
    do {
        newFoodPosition = {
            x: Math.floor(Math.random() * BOARD_SIZE) + 1,
            y: Math.floor(Math.random() * BOARD_SIZE) + 1
        };
    } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));

    food = newFoodPosition;
}

function moveSnake() {
    if (isGameOver) return;

    const newHead = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check for collision 
    if (
        newHead.x < 1 || newHead.x > BOARD_SIZE ||
        newHead.y < 1 || newHead.y > BOARD_SIZE ||
        snake.some((segment, index) => index !== 0 && segment.x === newHead.x && segment.y === newHead.y)
    ) {
        endGame();
        return;
    }

    snake.unshift(newHead);

    // Check for food
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 1;
        scoreDisplay.textContent = `Score: ${score}`;
        
        if (score >= WIN_SCORE) { 
            winGame();
            return;
        }

        placeFood(); 
    } else {
        snake.pop(); 
    }

    renderBoard();
}

function endGame() {
    clearInterval(gameInterval);
    isGameOver = true;
    messageArea.textContent = 'Mission Failed! You crashed. Try Again!';
    startButton.textContent = 'Restart Mission';
    startButton.style.display = 'block';
}

function winGame() {
    clearInterval(gameInterval);
    isGameOver = true;
    messageArea.textContent = `SUCCESS! Sahil, Score ${WIN_SCORE} Reached!`;
    nextButton.style.display = 'block';
}

// --- Direction Update Function (Handles both key presses and swipes) ---
function changeDirection(newDx, newDy) {
    if (Math.abs(newDx) === Math.abs(dx) && Math.abs(newDy) === Math.abs(dy)) return;
    
    if (!(dx === -newDx || dy === -newDy)) {
        dx = newDx;
        dy = newDy;
    }
}


// --- Event Listeners for Controls ---
startButton.addEventListener('click', startGame);

// 1. Desktop Controls (WASD/Arrows)
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            changeDirection(0, -1);
            break;
        case 'ArrowDown':
        case 's':
            changeDirection(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
            changeDirection(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
            changeDirection(1, 0);
            break;
    }
});


// 2. Mobile Touch/Swipe Controls
board.addEventListener('touchstart', e => {
    e.preventDefault(); // Prevents default browser scrolling
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

board.addEventListener('touchend', e => {
    if (isGameOver || startButton.style.display !== 'none') return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        // Horizontal swipe
        if (deltaX > 0) {
            changeDirection(1, 0); // Swipe Right
        } else {
            changeDirection(-1, 0); // Swipe Left
        }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > SWIPE_THRESHOLD) {
        // Vertical swipe
        if (deltaY > 0) {
            changeDirection(0, 1); // Swipe Down
        } else {
            changeDirection(0, -1); // Swipe Up
        }
    }
});


// --- Initial Setup ---
// Call meteor generation when the script runs
generateMeteors();
startButton.style.display = 'block';
