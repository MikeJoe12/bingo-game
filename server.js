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
let layoutsData = {
  layout1: { title: "Third Prize", layoutHTML: "", disabled: false  },
  layout2: { title: "Second Prize", layoutHTML: "", disabled: false  },
  layout3: { title: "First Prize", layoutHTML: "", disabled: false  },
};

io.on('connection', (socket) => {
   socket.on('markNumber', ({ playerName, number, userId }) => {
    const player = playerCards.find(p => p.userId === userId);
        if (player) {
            if (!player.markedNumbers) {
                player.markedNumbers = [];
            }
            
            const numberIndex = player.markedNumbers.indexOf(number);
            if (numberIndex === -1) {
                player.markedNumbers.push(number);
            } else {
                player.markedNumbers.splice(numberIndex, 1);
            }
        }
        
        io.emit('numberMarked', { playerName, number });
		    });

  // Add this new event
  socket.on('numberCalled', (number) => {
    io.emit('displayCalledNumber', number);
  });
   socket.emit('layoutsUpdate', layoutsData);

  // Update layouts and titles from index.html
socket.on('updateLayouts', (updatedData) => {
    // Merge updatedData into layoutsData
    Object.keys(updatedData).forEach((key) => {
        if (layoutsData[key]) {
            layoutsData[key] = {
                ...layoutsData[key], // Preserve existing properties
                ...updatedData[key], // Overwrite with updated properties
            };
        }
    });

    //console.log('Updated layoutsData:', layoutsData); // Debugging

    // Broadcast the updated layouts to all connected clients
    io.emit('layoutsUpdate', layoutsData);
});

});
// Add this new endpoint to server.js
app.get('/checkUsername/:username', (req, res) => {
    const username = req.params.username;
    const exists = playerCards.some(player => player.playerName.toLowerCase() === username.toLowerCase());
    res.json({ exists });
});

// New endpoint to check for existing cards
app.get('/checkExistingCard/:userId', (req, res) => {
    const userId = req.params.userId;
    const existingPlayer = playerCards.find(player => player.userId === userId);
    
    if (existingPlayer) {
        res.json({
            exists: true,
            playerData: existingPlayer
        });
    } else {
        res.json({
            exists: false
        });
    }
});

// Modified saveCard endpoint
app.post('/saveCard', (req, res) => {
    const { userId, playerName, card, markedNumbers } = req.body;
    
    // Check if player already exists
    const existingPlayerIndex = playerCards.findIndex(p => p.userId === userId);
    
    if (existingPlayerIndex !== -1) {
        // Update existing player's card
        playerCards[existingPlayerIndex] = {
            userId,
            playerName,
            card,
            markedNumbers
        };
    } else {
        // Add new player
        playerCards.push({
            userId,
            playerName,
            card,
            markedNumbers
        });
    }
    
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
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.get('/player', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player.html'));
});
app.get('/Shuffle.mp3', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Shuffle.mp3'));
});
// Modified removePlayer endpoint
app.delete('/removePlayer/:playerName', (req, res) => {
    const playerName = req.params.playerName;
    const initialLength = playerCards.length;
    
    playerCards = playerCards.filter(player => player.playerName !== playerName);
    
    if (playerCards.length < initialLength) {
        // Broadcast player removal to all clients
        io.emit('playerRemoved', { playerName });
        res.status(200).send({ message: `Player ${playerName} removed successfully.` });
    } else {
        res.status(404).send({ message: `Player ${playerName} not found.` });
    }
});
