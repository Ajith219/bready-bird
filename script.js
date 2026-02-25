// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔥 Responsive canvas
function resizeCanvas() {
    if (window.innerWidth < 500) {
        canvas.width = window.innerWidth * 0.95;
        canvas.height = window.innerHeight * 0.7;
    } else {
        canvas.width = 400;
        canvas.height = 600;
    }
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ================== IMAGES (FIXED LOADING) ==================
const birdImg = new Image();
const pipeImg = new Image();
const bgImg = new Image();

let imagesLoaded = 0;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 3) {
        console.log("All images loaded ✅");
    }
}

birdImg.onload = imageLoaded;
pipeImg.onload = imageLoaded;
bgImg.onload = imageLoaded;

birdImg.src = "assets/bird.png";
pipeImg.src = "assets/pipe.png";
bgImg.src = "assets/bg.png";

// ================== SOUNDS ==================
const jumpSound = document.getElementById("jumpSound");
const hitSound = document.getElementById("hitSound");

// ================== VARIABLES ==================
let bird, pipes, score, highScore, gameRunning;
let bgX = 0;
let canJump = true;

const pipeWidth = 60;
const gap = 180;

// ================== START GAME ==================
function startGame() {

    // 🚨 wait until images load
    if (imagesLoaded < 3) {
        alert("Game loading... please wait a second");
        return;
    }

    document.getElementById("startScreen").style.display = "none";
    canvas.style.display = "block";
    document.getElementById("gameOverScreen").style.display = "none";

    resizeCanvas();
    init();
    gameLoop();
}

// ================== RESTART ==================
function restartGame() {
    document.getElementById("gameOverScreen").style.display = "none";
    init();
    gameLoop();
}

// ================== INIT ==================
function init() {
    bird = {
        x: 60,
        y: 200,
        width: 70,
        height: 50,
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

// ================== JUMP ==================
function jump() {
    if (!gameRunning) return;

    bird.velocity = bird.jump;

    jumpSound.pause();
    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => {});
}

// Keyboard
document.addEventListener("keydown", e => {
    if (e.code === "Space" && canJump) {
        jump();
        canJump = false;
    }
});
document.addEventListener("keyup", e => {
    if (e.code === "Space") canJump = true;
});

// Touch + click
canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    jump();
});

// ================== PIPES ==================
function createPipe() {
    let height = Math.random() * 250 + 50;
    pipes.push({
        x: canvas.width,
        top: height,
        bottom: height + gap,
        passed: false
    });
}

// ================== GAME LOOP ==================
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background scroll
    bgX -= 1;
    if (bgX <= -canvas.width) bgX = 0;

    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Pipes
    for (let p of pipes) {
        p.x -= 3;

        ctx.drawImage(pipeImg, p.x, 0, pipeWidth, p.top);
        ctx.drawImage(pipeImg, p.x, p.bottom, pipeWidth, canvas.height);

        // Collision
        if (
            bird.x < p.x + pipeWidth &&
            bird.x + bird.width > p.x &&
            (bird.y < p.top || bird.y + bird.height > p.bottom)
        ) {
            endGame();
        }

        // Score
        if (!p.passed && p.x + pipeWidth < bird.x) {
            score++;
            p.passed = true;
        }
    }

    // Ground collision
    if (bird.y + bird.height >= canvas.height) {
        endGame();
    }

    // Create new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < 200) {
        createPipe();
    }

    // Remove old pipes
    if (pipes.length && pipes[0].x < -pipeWidth) {
        pipes.shift();
    }

    // Score text
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
    ctx.fillText("High: " + highScore, 10, 50);

    requestAnimationFrame(gameLoop);
}

// ================== END GAME ==================
function endGame() {
    gameRunning = false;

    hitSound.pause();
    hitSound.currentTime = 0;
    hitSound.play().catch(() => {});

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    document.getElementById("finalScore").innerText =
        "Score: " + score + " | High: " + highScore;

    document.getElementById("gameOverScreen").style.display = "block";
}
