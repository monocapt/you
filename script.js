// --- Game Configuration ---
const BOARD_SIZE = 20; 
const GAME_SPEED = 200; 
const WIN_SCORE = 5; 
const NUM_METEORS = 30; // Number of meteors to generate

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

// --- Background Animation Function ---
function generateMeteors() {
    if (!meteorContainer) return;

    for (let i = 0; i < NUM_METEORS; i++) {
        const meteor = document.createElement('div');
        meteor.classList.add('meteor');

        // Random position for meteors
        const startX = Math.random() * 100 + 100; // Start off-screen right
        const startY = Math.random() * 100 + 10;  // Start near the top
        
        // Randomize speed and delay for a natural shower look
        const duration = Math.random() * 5 + 3; // 3s to 8s duration
        const delay = Math.random() * 6; // 0s to 6s delay

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

// --- Event Listeners for Controls ---
startButton.addEventListener('click', startGame);

document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

// --- Initial Setup ---
// The generateMeteors function is called automatically via the <body> tag's 'onload' event.
startButton.style.display = 'block';