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
