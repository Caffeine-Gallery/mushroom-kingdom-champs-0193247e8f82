import { backend } from "declarations/backend";

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        this.player = {
            x: 50,
            y: 300,
            width: 30,
            height: 30,
            velocityY: 0,
            speed: 5,
            jumping: false
        };
        
        this.platforms = [
            { x: 0, y: 350, width: 800, height: 50 },
            { x: 300, y: 250, width: 100, height: 20 },
            { x: 500, y: 200, width: 100, height: 20 }
        ];
        
        this.coins = [
            { x: 320, y: 200, width: 20, height: 20, collected: false },
            { x: 520, y: 150, width: 20, height: 20, collected: false }
        ];
        
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.keys = {};
        
        this.setupEventListeners();
        this.gameLoop();
        this.updateLeaderboard();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        document.getElementById('submitScore').addEventListener('click', () => this.submitScore());
        document.getElementById('restartGame').addEventListener('click', () => this.restart());
    }

    update() {
        if (this.gameOver) return;

        // Horizontal movement
        if (this.keys['ArrowRight']) this.player.x += this.player.speed;
        if (this.keys['ArrowLeft']) this.player.x -= this.player.speed;

        // Jumping
        if (this.keys['ArrowUp'] && !this.player.jumping) {
            this.player.velocityY = -15;
            this.player.jumping = true;
        }

        // Gravity
        this.player.velocityY += 0.8;
        this.player.y += this.player.velocityY;

        // Platform collision
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.player, platform)) {
                if (this.player.velocityY > 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.jumping = false;
                }
            }
        });

        // Coin collection
        this.coins.forEach(coin => {
            if (!coin.collected && this.checkCollision(this.player, coin)) {
                coin.collected = true;
                this.score += 100;
                document.getElementById('score').textContent = this.score;
            }
        });

        // Check if player fell off
        if (this.player.y > this.canvas.height) {
            this.lives--;
            document.getElementById('lives').textContent = this.lives;
            if (this.lives <= 0) {
                this.endGame();
            } else {
                this.resetPlayerPosition();
            }
        }

        // Boundaries
        this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.player.width));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw platforms
        this.ctx.fillStyle = '#8B4513';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // Draw coins
        this.ctx.fillStyle = '#FFD700';
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.beginPath();
                this.ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Draw player
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    resetPlayerPosition() {
        this.player.x = 50;
        this.player.y = 300;
        this.player.velocityY = 0;
    }

    async endGame() {
        this.gameOver = true;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    async submitScore() {
        const playerName = document.getElementById('playerName').value;
        if (playerName) {
            await backend.addScore(playerName, this.score);
            await this.updateLeaderboard();
        }
    }

    async updateLeaderboard() {
        const scores = await backend.getTopScores();
        const leaderboardDiv = document.getElementById('leaderboardScores');
        leaderboardDiv.innerHTML = '';
        
        scores.forEach((score, index) => {
            const entry = document.createElement('div');
            entry.className = 'score-entry';
            entry.textContent = `${index + 1}. ${score.player}: ${score.score}`;
            leaderboardDiv.appendChild(entry);
        });
    }

    restart() {
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.resetPlayerPosition();
        this.coins.forEach(coin => coin.collected = false);
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('gameOver').classList.add('hidden');
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};
