# Connect 4 Multiplayer Game

A real-time multiplayer Connect 4 game that can be played in web browsers. Players can create rooms, invite friends, and play against each other in real-time using WebSocket technology.

## Features

- 🎯 **Real-time Multiplayer**: Play with friends using WebSocket connections
- 🏠 **Room-based System**: Create private rooms or join existing ones
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔗 **Easy Invitations**: Share room links to invite friends
- 🎮 **Quick Play**: Join random rooms for instant games
- 💾 **Game State Management**: Automatic game state synchronization
- 🏆 **Win Detection**: Automatic win/loss detection with visual feedback

## How to Play

1. **Create or Join a Room**:
   - Enter a room name and your player name
   - Click "Create Room" to start a new game
   - Click "Join Room" to join an existing game
   - Click "Quick Play" for instant matchmaking

2. **Invite Friends**:
   - Share the generated invite link with your friends
   - Friends can click the link to join your game automatically

3. **Gameplay**:
   - Players take turns dropping colored discs into columns
   - First player to get 4 discs in a row (horizontal, vertical, or diagonal) wins
   - Red player goes first, then yellow player

## Deployment Options

### Option 1: GitHub Pages (Static Version)

For GitHub Pages deployment, use the static version (`index.html`):

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. The game will be available at `https://yourusername.github.io/connect4`

**Note**: The GitHub Pages version uses localStorage for game state sharing between players in the same room.

### Option 2: Full WebSocket Server

For real-time multiplayer with WebSocket support:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/connect4-multiplayer.git
   cd connect4-multiplayer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and go to `http://localhost:3000`

## Project Structure

```
connect4/
├── index.html              # Static version for GitHub Pages
├── index-websocket.html    # WebSocket version
├── server.js               # Node.js WebSocket server
├── package.json            # Node.js dependencies
└── README.md              # This file
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Deployment**: GitHub Pages, Heroku (for server version)

## API Endpoints

### WebSocket Events

#### Client to Server:
- `joinRoom`: Join a game room
- `makeMove`: Make a move in the game
- `newGame`: Start a new game in the same room
- `getRoomList`: Get list of available rooms

#### Server to Client:
- `playerAssigned`: Player color and number assigned
- `playerJoined`: Another player joined the room
- `gameStarted`: Game has started
- `moveMade`: A move was made
- `gameEnded`: Game has ended with winner
- `newGameStarted`: A new game has started
- `playerLeft`: A player left the room
- `error`: Error message

### REST Endpoints

- `GET /health`: Server health check
- `GET /api/room/:roomName`: Get room information

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Connect 4 is a trademark of Hasbro, Inc.
- This is an educational project and not affiliated with Hasbro
