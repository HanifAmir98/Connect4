const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main game file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Game state storage (in production, use Redis or database)
const gameRooms = new Map();
const playerSockets = new Map();

// Initialize empty game board
function createEmptyBoard() {
    return Array(6).fill(null).map(() => Array(7).fill(null));
}

// Check for winning condition
function checkWin(board, row, col, player) {
    // Check horizontal
    let count = 1;
    for (let c = col - 1; c >= 0 && board[row][c] === player; c--) count++;
    for (let c = col + 1; c < 7 && board[row][c] === player; c++) count++;
    if (count >= 4) return true;

    // Check vertical
    count = 1;
    for (let r = row - 1; r >= 0 && board[r][col] === player; r--) count++;
    for (let r = row + 1; r < 6 && board[r][col] === player; r++) count++;
    if (count >= 4) return true;

    // Check diagonal (top-left to bottom-right)
    count = 1;
    for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && board[r][c] === player; r--, c--) count++;
    for (let r = row + 1, c = col + 1; r < 6 && c < 7 && board[r][c] === player; r++, c++) count++;
    if (count >= 4) return true;

    // Check diagonal (top-right to bottom-left)
    count = 1;
    for (let r = row - 1, c = col + 1; r >= 0 && c < 7 && board[r][c] === player; r--, c++) count++;
    for (let r = row + 1, c = col - 1; r < 6 && c >= 0 && board[r][c] === player; r++, c--) count++;
    if (count >= 4) return true;

    return false;
}

// Check for draw
function checkDraw(board) {
    return board[0].every(cell => cell !== null);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Join room
    socket.on('joinRoom', (data) => {
        const { roomName, playerName } = data;
        
        if (!roomName) {
            socket.emit('error', { message: 'Room name is required' });
            return;
        }

        // Leave any previous rooms
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
            }
        });

        // Join the new room
        socket.join(roomName);
        socket.currentRoom = roomName;
        socket.playerName = playerName || `Player ${socket.id.substr(0, 6)}`;

        // Initialize room if it doesn't exist
        if (!gameRooms.has(roomName)) {
            gameRooms.set(roomName, {
                board: createEmptyBoard(),
                currentPlayer: 'red',
                players: {},
                gameActive: false,
                winner: null
            });
        }

        const room = gameRooms.get(roomName);
        const playerCount = Object.keys(room.players).length;

        // Assign player color and add to room
        if (playerCount === 0) {
            room.players[socket.id] = {
                name: socket.playerName,
                color: 'red',
                ready: false
            };
            socket.emit('playerAssigned', { color: 'red', playerNumber: 1 });
        } else if (playerCount === 1) {
            room.players[socket.id] = {
                name: socket.playerName,
                color: 'yellow',
                ready: false
            };
            socket.emit('playerAssigned', { color: 'yellow', playerNumber: 2 });
            
            // Start game when second player joins
            room.gameActive = true;
            io.to(roomName).emit('gameStarted', {
                board: room.board,
                currentPlayer: room.currentPlayer,
                players: room.players
            });
        } else {
            // Room is full
            socket.emit('error', { message: 'Room is full' });
            socket.leave(roomName);
            return;
        }

        // Store socket reference
        playerSockets.set(socket.id, socket);

        // Notify all players in room about player update
        io.to(roomName).emit('playerJoined', {
            players: room.players,
            playerCount: Object.keys(room.players).length
        });

        console.log(`Player ${socket.id} joined room ${roomName}`);
    });

    // Handle move
    socket.on('makeMove', (data) => {
        const { column } = data;
        const roomName = socket.currentRoom;

        if (!roomName || !gameRooms.has(roomName)) {
            socket.emit('error', { message: 'Not in a valid room' });
            return;
        }

        const room = gameRooms.get(roomName);
        const player = room.players[socket.id];

        if (!player || !room.gameActive) {
            socket.emit('error', { message: 'Game not active or invalid player' });
            return;
        }

        if (room.currentPlayer !== player.color) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        // Find the lowest empty row in the column
        let moveRow = -1;
        for (let row = 5; row >= 0; row--) {
            if (!room.board[row][column]) {
                room.board[row][column] = player.color;
                moveRow = row;
                break;
            }
        }

        if (moveRow === -1) {
            socket.emit('error', { message: 'Column is full' });
            return;
        }

        // Check for win
        if (checkWin(room.board, moveRow, column, player.color)) {
            room.gameActive = false;
            room.winner = player.color;
            io.to(roomName).emit('gameEnded', {
                board: room.board,
                winner: player.color,
                winningMove: { row: moveRow, col: column }
            });
        } else if (checkDraw(room.board)) {
            room.gameActive = false;
            room.winner = 'draw';
            io.to(roomName).emit('gameEnded', {
                board: room.board,
                winner: 'draw'
            });
        } else {
            // Switch turns
            room.currentPlayer = room.currentPlayer === 'red' ? 'yellow' : 'red';
            io.to(roomName).emit('moveMade', {
                board: room.board,
                currentPlayer: room.currentPlayer,
                lastMove: { row: moveRow, col: column, color: player.color }
            });
        }
    });

    // Handle new game request
    socket.on('newGame', () => {
        const roomName = socket.currentRoom;

        if (!roomName || !gameRooms.has(roomName)) {
            socket.emit('error', { message: 'Not in a valid room' });
            return;
        }

        const room = gameRooms.get(roomName);
        
        // Reset game state
        room.board = createEmptyBoard();
        room.currentPlayer = 'red';
        room.gameActive = true;
        room.winner = null;

        io.to(roomName).emit('newGameStarted', {
            board: room.board,
            currentPlayer: room.currentPlayer
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);

        if (socket.currentRoom) {
            const roomName = socket.currentRoom;
            const room = gameRooms.get(roomName);

            if (room && room.players[socket.id]) {
                delete room.players[socket.id];
                
                // If no players left, remove the room
                if (Object.keys(room.players).length === 0) {
                    gameRooms.delete(roomName);
                } else {
                    // Notify remaining players
                    io.to(roomName).emit('playerLeft', {
                        players: room.players,
                        playerCount: Object.keys(room.players).length
                    });
                }
            }
        }

        playerSockets.delete(socket.id);
    });

    // Handle room list request
    socket.on('getRoomList', () => {
        const rooms = Array.from(gameRooms.entries()).map(([name, room]) => ({
            name,
            playerCount: Object.keys(room.players).length,
            gameActive: room.gameActive
        }));
        socket.emit('roomList', rooms);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        rooms: gameRooms.size,
        players: playerSockets.size,
        timestamp: new Date().toISOString()
    });
});

// Get room info endpoint
app.get('/api/room/:roomName', (req, res) => {
    const { roomName } = req.params;
    const room = gameRooms.get(roomName);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
        roomName,
        playerCount: Object.keys(room.players).length,
        gameActive: room.gameActive,
        currentPlayer: room.currentPlayer
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Connect 4 server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
