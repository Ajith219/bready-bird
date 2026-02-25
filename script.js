// ===== Canvas Setup =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ===== Images =====
const birdImg = new Image();
birdImg.src = "assets/bird.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";

const bgImg = new Image();
bgImg.src = "assets/bg.png";

// ===== Sounds =====
const jumpSound = document.getElementById("jumpSound");
const hitSound = document.getElementById("hitSound");

// ===== Game Variables =====
let bird, pipes, score, highScore, gameRunning;
let bgX = 0;
let canJump = true;

const pipeWidth = 60;
const gap = 180;   // 🔥 increased gap for bigger bird

// ===== Start Game =====
function startGame() {
    document.getElementById("startScreen").style.display = "none";
    canvas.style.display = "block";
    init();
    gameLoop();
}

// ===== Restart Game =====
function restartGame() {
    document.getElementById("gameOverScreen").style.display = "none";
    init();
    gameLoop();
}

// ===== Initialize =====
function init() {
    bird = {
        x: 60,
        y: 200,
        width: 70,   // 🔥 bigger bird
        height: 50,  // 🔥 bigger bird
        gravity: 0.5,
        velocity: 0,
        jump: -8
    };

    pipes = [];
    score = 0;
    highScore = localStorage.getItem("highScore") || 0;
    gameRunning = true;
    bgX = 0;
    canJump = true;
}

// ===== Jump Control =====
function jump() {
    if (!gameRunning) return;

    bird.velocity = bird.jump;

    if (jumpSound) {
        jumpSound.pause();
        jumpSound.currentTime = 0;
        jumpSound.play().catch(() => {});
    }
}

// ===== Keyboard Controls =====
document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && canJump) {
        jump();
        canJump = false;
    }
});

document.addEventListener("keyup", function (e) {
    if (e.code === "Space") {
        canJump = true;
    }
});

// ===== Mouse / Touch =====
canvas.addEventListener("click", jump);

// ===== Create Pipe =====
function createPipe() {
    let height = Math.random() * 250 + 50;

    pipes.push({
        x: canvas.width,
        top: height,
        bottom: height + gap,
        passed: false
    });
}

// ===== Game Loop =====
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ===== Background Scroll =====
    bgX -= 1;
    if (bgX <= -canvas.width) bgX = 0;

    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    // ===== Bird Physics =====
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // ===== Pipes =====
    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        p.x -= 3;

        ctx.drawImage(pipeImg, p.x, 0, pipeWidth, p.top);
        ctx.drawImage(pipeImg, p.x, p.bottom, pipeWidth, canvas.height);

        // Collision detection
        if (
            bird.x < p.x + pipeWidth &&
            bird.x + bird.width > p.x &&
            (bird.y < p.top || bird.y + bird.height > p.bottom)
        ) {
            endGame();
        }

        // Score update
        if (!p.passed && p.x + pipeWidth < bird.x) {
            score++;
            p.passed = true;
        }
    }

    // Ground collision
    if (bird.y + bird.height >= canvas.height) {
        endGame();
    }

    // New pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < 200) {
        createPipe();
    }

    // Remove old pipes
    if (pipes.length > 0 && pipes[0].x < -pipeWidth) {
        pipes.shift();
    }

    // Score display
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
    ctx.fillText("High: " + highScore, 10, 50);

    requestAnimationFrame(gameLoop);
}

// ===== End Game =====
function endGame() {
    if (!gameRunning) return;

    gameRunning = false;

    if (hitSound) {
        hitSound.pause();
        hitSound.currentTime = 0;
        hitSound.play().catch(() => {});
    }

    // update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    document.getElementById("finalScore").innerText =
        "Score: " + score + " | High: " + highScore;

    document.getElementById("gameOverScreen").style.display = "block";
}