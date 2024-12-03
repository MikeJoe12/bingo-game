const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Use process.env.PORT instead of hardcoded port
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let playerCards = [];

app.post('/saveCard', (req, res) => {
    const { playerName, card } = req.body;
    playerCards.push({ playerName, card });
    res.sendStatus(200);
});

app.get('/getCards', (req, res) => {
    res.json(playerCards);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

app.get('/caller', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/markNumber', (req, res) => {
    const { playerName, number } = req.body;
    // Broadcast the marked number to all connected clients
    io.emit('numberMarked', { playerName, number });
    res.sendStatus(200);
});

io.on('connection', (socket) => {
    socket.on('markNumber', ({ playerName, number }) => {
        io.emit('numberMarked', { playerName, number });
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.get('/player', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player.html'));
});
app.get('/Shuffle.mp3', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Shuffle.mp3'));
});
app.post('/deactivatePlayer/:playerName', (req, res) => {
  const playerName = req.params.playerName;
  const playerIndex = playerCards.findIndex(player => player.playerName === playerName);
  
  if (playerIndex !== -1) {
    playerCards[playerIndex].active = false;
    io.emit('playerDeactivated', { playerName });
    res.status(200).send({ message: `Player ${playerName} deactivated successfully.` });
  } else {
    res.status(404).send({ message: `Player ${playerName} not found.` });
  }
});
// Endpoint to remove a player by name
app.delete('/removePlayer/:playerName', (req, res) => {
    const playerName = req.params.playerName;
    const initialLength = playerCards.length;
    
    // Filter out the player from the array
    playerCards = playerCards.filter(player => player.playerName !== playerName);
    
    if (playerCards.length < initialLength) {
        res.status(200).send({ message: `Player ${playerName} removed successfully.` });
    } else {
        res.status(404).send({ message: `Player ${playerName} not found.` });
    }
});