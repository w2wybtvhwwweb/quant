// 游戏配置
const CONFIG = {
    canvas: null,
    ctx: null,
    gridSize: 20,
    tileCount: 20,
    snake: [],
    food: { x: 0, y: 0 },
    dx: 0,
    dy: 0,
    score: 0,
    highScore: 0,
    gameLoop: null,
    gameSpeed: 100,
    isGameOver: false
};

// 初始化游戏
function initGame() {
    CONFIG.canvas = document.getElementById('gameCanvas');
    CONFIG.ctx = CONFIG.canvas.getContext('2d');

    // 加载最高分
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
        CONFIG.highScore = parseInt(savedHighScore);
        document.getElementById('highScore').textContent = CONFIG.highScore;
    }

    // 添加事件监听
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyPress);

    // 绘制初始画面
    drawGame();
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    CONFIG.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    CONFIG.dx = 1;
    CONFIG.dy = 0;
    CONFIG.score = 0;
    CONFIG.isGameOver = false;

    document.getElementById('score').textContent = '0';

    // 生成食物
    generateFood();

    // 清除之前的游戏循环
    if (CONFIG.gameLoop) {
        clearInterval(CONFIG.gameLoop);
    }

    // 开始游戏循环
    CONFIG.gameLoop = setInterval(updateGame, CONFIG.gameSpeed);
}

// 生成食物
function generateFood() {
    let foodPlaced = false;

    while (!foodPlaced) {
        CONFIG.food.x = Math.floor(Math.random() * CONFIG.tileCount);
        CONFIG.food.y = Math.floor(Math.random() * CONFIG.tileCount);

        // 确保食物不在蛇身上
        foodPlaced = !CONFIG.snake.some(segment =>
            segment.x === CONFIG.food.x && segment.y === CONFIG.food.y
        );
    }
}

// 处理键盘输入
function handleKeyPress(event) {
    const key = event.key;

    // 防止默认滚动行为
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        event.preventDefault();
    }

    // 不能直接反向移动
    if (key === 'ArrowUp' && CONFIG.dy === 0) {
        CONFIG.dx = 0;
        CONFIG.dy = -1;
    } else if (key === 'ArrowDown' && CONFIG.dy === 0) {
        CONFIG.dx = 0;
        CONFIG.dy = 1;
    } else if (key === 'ArrowLeft' && CONFIG.dx === 0) {
        CONFIG.dx = -1;
        CONFIG.dy = 0;
    } else if (key === 'ArrowRight' && CONFIG.dx === 0) {
        CONFIG.dx = 1;
        CONFIG.dy = 0;
    }
}

// 更新游戏状态
function updateGame() {
    if (CONFIG.isGameOver) {
        return;
    }

    // 计算新的蛇头位置
    const head = {
        x: CONFIG.snake[0].x + CONFIG.dx,
        y: CONFIG.snake[0].y + CONFIG.dy
    };

    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }

    // 将新头部添加到蛇
    CONFIG.snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === CONFIG.food.x && head.y === CONFIG.food.y) {
        CONFIG.score += 10;
        document.getElementById('score').textContent = CONFIG.score;

        // 更新最高分
        if (CONFIG.score > CONFIG.highScore) {
            CONFIG.highScore = CONFIG.score;
            localStorage.setItem('snakeHighScore', CONFIG.highScore);
            document.getElementById('highScore').textContent = CONFIG.highScore;
        }

        generateFood();
    } else {
        // 如果没吃到食物，移除尾部
        CONFIG.snake.pop();
    }

    // 绘制游戏
    drawGame();
}

// 检查碰撞
function checkCollision(head) {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= CONFIG.tileCount ||
        head.y < 0 || head.y >= CONFIG.tileCount) {
        return true;
    }

    // 检查自身碰撞
    for (let segment of CONFIG.snake) {
        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }

    return false;
}

// 游戏结束
function gameOver() {
    CONFIG.isGameOver = true;
    clearInterval(CONFIG.gameLoop);

    // 绘制游戏结束画面
    CONFIG.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    CONFIG.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    CONFIG.ctx.fillStyle = 'white';
    CONFIG.ctx.font = '30px Arial';
    CONFIG.ctx.textAlign = 'center';
    CONFIG.ctx.fillText('游戏结束!', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 - 20);
    CONFIG.ctx.font = '20px Arial';
    CONFIG.ctx.fillText('得分: ' + CONFIG.score, CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 + 20);
}

// 绘制游戏
function drawGame() {
    // 清空画布
    CONFIG.ctx.fillStyle = '#1a1a1a';
    CONFIG.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    // 绘制网格
    CONFIG.ctx.strokeStyle = '#2a2a2a';
    CONFIG.ctx.lineWidth = 1;
    for (let i = 0; i <= CONFIG.tileCount; i++) {
        CONFIG.ctx.beginPath();
        CONFIG.ctx.moveTo(i * CONFIG.gridSize, 0);
        CONFIG.ctx.lineTo(i * CONFIG.gridSize, CONFIG.canvas.height);
        CONFIG.ctx.stroke();

        CONFIG.ctx.beginPath();
        CONFIG.ctx.moveTo(0, i * CONFIG.gridSize);
        CONFIG.ctx.lineTo(CONFIG.canvas.width, i * CONFIG.gridSize);
        CONFIG.ctx.stroke();
    }

    // 绘制蛇
    CONFIG.snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            CONFIG.ctx.fillStyle = '#4CAF50';
        } else {
            // 蛇身
            CONFIG.ctx.fillStyle = '#66BB6A';
        }

        CONFIG.ctx.fillRect(
            segment.x * CONFIG.gridSize + 1,
            segment.y * CONFIG.gridSize + 1,
            CONFIG.gridSize - 2,
            CONFIG.gridSize - 2
        );

        // 添加光泽效果
        if (index === 0) {
            CONFIG.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            CONFIG.ctx.fillRect(
                segment.x * CONFIG.gridSize + 2,
                segment.y * CONFIG.gridSize + 2,
                CONFIG.gridSize - 10,
                CONFIG.gridSize - 10
            );
        }
    });

    // 绘制食物
    CONFIG.ctx.fillStyle = '#FF5252';
    CONFIG.ctx.beginPath();
    CONFIG.ctx.arc(
        CONFIG.food.x * CONFIG.gridSize + CONFIG.gridSize / 2,
        CONFIG.food.y * CONFIG.gridSize + CONFIG.gridSize / 2,
        CONFIG.gridSize / 2 - 2,
        0,
        2 * Math.PI
    );
    CONFIG.ctx.fill();

    // 食物光泽
    CONFIG.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    CONFIG.ctx.beginPath();
    CONFIG.ctx.arc(
        CONFIG.food.x * CONFIG.gridSize + CONFIG.gridSize / 2 - 2,
        CONFIG.food.y * CONFIG.gridSize + CONFIG.gridSize / 2 - 2,
        CONFIG.gridSize / 4,
        0,
        2 * Math.PI
    );
    CONFIG.ctx.fill();
}

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);
