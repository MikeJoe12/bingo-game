let isPlayerActive = false;
let isLoginEnabled = false;
let playerName = '';
let currentPlayerName = '';
const socket = io();

// Helper functions
function getMarkedNumbers() {
    return JSON.parse(localStorage.getItem('markedNumbers') || '[]');
}

function getCalledNumbers() {
    return JSON.parse(localStorage.getItem('calledNumbers') || '[]');
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

function getUserId() {
    let userId = localStorage.getItem('bingoUserId');
    if (!userId) {
        userId = generateUserId();
        localStorage.setItem('bingoUserId', userId);
    }
    return userId;
}

function generateTableCells() {
    let cells = '';
    for (let i = 0; i < 25; i++) {
        cells += `<div class="bingo-layout-cell"></div>`;
    }
    return cells;
}

const chimeSound = new Howl({
    src: ['/chime.mp3'],
    volume: 0.5
});

function playChime() {
    const chimeToggle = document.getElementById('chimeToggle');
    if (chimeToggle && chimeToggle.checked) {
        chimeSound.play();
    }
}

function updateCellStatus(cell) {
    if (!cell || cell.textContent === 'FREE') return;
    
    const number = parseInt(cell.textContent);
    if (isNaN(number)) return;
    
    const markedNumbers = getMarkedNumbers();
    const calledNumbers = getCalledNumbers();
    
    cell.classList.remove('red-border', 'marked');
    
    if (markedNumbers.includes(number)) {
        cell.classList.add('marked');
    } else if (calledNumbers.includes(number)) {
        cell.classList.add('red-border');
    }
}
// Add these socket event handlers
socket.on('gameReset', () => {
    // Clear all stored numbers
    localStorage.removeItem('calledNumbers');
    localStorage.removeItem('markedNumbers');
    localStorage.removeItem('lastCalledNumber');
});

socket.on('forceDisconnect', () => {
    // Clear local storage
    localStorage.removeItem('calledNumbers');
    localStorage.removeItem('markedNumbers');
    localStorage.removeItem('lastCalledNumber');
    
    // Deactivate player
    isPlayerActive = false;
    
    // Show message about game reset
    const messageDiv = document.createElement('div');
    messageDiv.className = 'deactivation-message';
    messageDiv.innerHTML = `
        <p>The game has been reset by the host.</p>
        <p>Please wait for the host to enable player registration again.</p>
        <button onclick="window.location.reload()">Refresh Page</button>
    `;
    document.body.appendChild(messageDiv);
});
function updateCalledNumberDisplay(lastCalledNumber) {
    const calledNumberContainer = document.getElementById('calledNumberContainer');
    if (!calledNumberContainer) return;

    calledNumberContainer.innerHTML = `
        <span class="ball-letter">${lastCalledNumber.letter}</span>
        <span class="ball-number">${lastCalledNumber.number}</span>
        <div class="ball-shine"></div>
    `;

    let bgColor;
    if (lastCalledNumber.letter === 'B') bgColor = 'radial-gradient(circle at 30% 30%, #4169E1, #0000CD)';
    else if (lastCalledNumber.letter === 'I') bgColor = 'radial-gradient(circle at 30% 30%, #FF4500, #DC143C)';
    else if (lastCalledNumber.letter === 'N') bgColor = 'white';
    else if (lastCalledNumber.letter === 'G') bgColor = 'radial-gradient(circle at 30% 30%, #32CD32, #006400)';
    else if (lastCalledNumber.letter === 'O') bgColor = 'radial-gradient(circle at 30% 30%, #FFD700, #DAA520)';

    calledNumberContainer.style.background = bgColor;
    calledNumberContainer.style.color = (lastCalledNumber.letter === 'N' || lastCalledNumber.letter === 'O') ? 'black' : 'white';
}

function handleCellClick(cell) {
    if (!isPlayerActive || cell.textContent === 'FREE') return;
    
    const number = parseInt(cell.textContent);
    if (isNaN(number)) return;
    
    const calledNumbers = getCalledNumbers();
    if (!calledNumbers.includes(number)) return; // Only allow clicking called numbers
    
    const markedNumbers = getMarkedNumbers();
    
    if (markedNumbers.includes(number)) {
        // Unmark the number
        const index = markedNumbers.indexOf(number);
        markedNumbers.splice(index, 1);
        cell.classList.remove('marked');
        cell.classList.add('red-border');
    } else {
        // Mark the number
        markedNumbers.push(number);
        cell.classList.add('marked');
        cell.classList.remove('red-border');
    }
    
    localStorage.setItem('markedNumbers', JSON.stringify(markedNumbers));
    socket.emit('markNumber', { playerName: currentPlayerName, number, userId: getUserId() });
}

function createNewCard(userId, playerName) {
    const card = [];
    const usedNumbers = new Set();
    const headers = ['B', 'I', 'N', 'G', 'O'];

    // Generate card numbers
    for (let i = 0; i < 5; i++) {
        const row = [];
        for (let j = 0; j < 5; j++) {
            let num;
            if (i === 2 && j === 2) {
                num = 'FREE';
            } else {
                do {
                    num = Math.floor(Math.random() * 15) + 1 + (j * 15);
                } while (usedNumbers.has(num));
                usedNumbers.add(num);
            }
            row.push(num);
        }
        card.push(row);
    }

    // Save card to server
    fetch('/saveCard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            userId,
            playerName, 
            card,
            markedNumbers: []
        }),
    })
    .then(() => {
        loadExistingCard({ playerName, card, markedNumbers: [] });
    });
}

function loadExistingCard(playerData) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('playerNameDisplay').textContent = `${playerData.playerName}'s Bingo Card`;
    document.getElementById('playerNameDisplay').style.display = 'block';
    document.getElementById('chimeToggleContainer').classList.add('visible');
    
    const table = document.getElementById('bingoCard');
    table.innerHTML = '';
    
    const headerRow = table.insertRow();
    ['B', 'I', 'N', 'G', 'O'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    for (let i = 0; i < 5; i++) {
        const row = table.insertRow();
        for (let j = 0; j < 5; j++) {
            const cell = row.insertCell();
            const number = playerData.card[i][j];
            cell.textContent = number;
            
            if (number === 'FREE') {
                cell.classList.add('free-cell');
            } else {
                cell.onclick = () => handleCellClick(cell);
            }
        }
    }
    
    currentPlayerName = playerData.playerName;
    playerName = playerData.playerName;
    isPlayerActive = true;
    
    // Initialize with any existing marked numbers
    if (playerData.markedNumbers) {
        localStorage.setItem('markedNumbers', JSON.stringify(playerData.markedNumbers));
    }
    
    // Request and load current game state
    socket.emit('requestCalledNumbers');
    socket.emit('playerActivated', playerData.playerName);
}

function disableBingoCard() {
    const bingoCard = document.getElementById('bingoCard');
    if (bingoCard) {
        bingoCard.classList.add('disabled');
        const cells = bingoCard.getElementsByTagName('td');
        for (let cell of cells) {
            cell.onclick = null;
            cell.style.cursor = 'not-allowed';
        }
    }
}

function showDeactivationMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'deactivation-message';
    messageDiv.innerHTML = `
        <p>Your bingo card has been deactivated by the host.</p>
        <button onclick="window.location.reload()">Start New Game</button>
    `;
    document.body.appendChild(messageDiv);
}

function generateCard() {
    if (!isLoginEnabled) {
        alert('Login is currently disabled by the host. Please wait for the host to enable player login.');
        return;
    }

    const userId = getUserId();
    const playerNameInput = document.getElementById('playerName');
    const enteredName = playerNameInput.value.trim();

    if (!enteredName) {
        alert('Please enter your name');
        return;
    }

    fetch(`/checkUsername/${encodeURIComponent(enteredName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                const existingErrorMsg = document.getElementById('usernameError');
                if (!existingErrorMsg) {
                    const errorMsg = document.createElement('div');
                    errorMsg.id = 'usernameError';
                    errorMsg.style.color = 'red';
                    errorMsg.style.marginTop = '5px';
                    errorMsg.style.fontSize = '0.9rem';
                    errorMsg.textContent = 'This username already exists. Please choose a different name.';
                    playerNameInput.parentNode.insertBefore(errorMsg, playerNameInput.nextSibling);
                }
                playerNameInput.style.borderColor = 'red';
                return;
            }

            const errorMsg = document.getElementById('usernameError');
            if (errorMsg) {
                errorMsg.remove();
            }
            playerNameInput.style.borderColor = '';

            currentPlayerName = enteredName;
            playerName = enteredName;

            chimeSound.play();
            document.getElementById('chimeToggleContainer').classList.add('visible');
            
            fetch(`/checkExistingCard/${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.exists) {
                        loadExistingCard(data.playerData);
                    } else {
                        createNewCard(userId, playerName);
                        socket.emit('playerActivated', playerName);
                        isPlayerActive = true;
                    }
                })
                .catch(error => console.error('Error:', error));
        })
        .catch(error => {
            console.error('Error checking username:', error);
            alert('An error occurred while checking the username. Please try again.');
        });
}

// Socket event handlers
socket.on('displayCalledNumber', (number) => {
    if (!isPlayerActive) return;
    
    let letter = '';
    if (number >= 1 && number <= 15) letter = 'B';
    else if (number >= 16 && number <= 30) letter = 'I';
    else if (number >= 31 && number <= 45) letter = 'N';
    else if (number >= 46 && number <= 60) letter = 'G';
    else if (number >= 61 && number <= 75) letter = 'O';
    
    const calledNumbers = getCalledNumbers();
    if (!calledNumbers.includes(number)) {
        calledNumbers.push(number);
        localStorage.setItem('calledNumbers', JSON.stringify(calledNumbers));
    }
    
    localStorage.setItem('lastCalledNumber', JSON.stringify({ number, letter }));
    updateCalledNumberDisplay({ number, letter });
    
    const cells = document.querySelectorAll('#bingoCard td');
    cells.forEach(cell => {
        if (parseInt(cell.textContent) === number) {
            const markedNumbers = getMarkedNumbers();
            if (!markedNumbers.includes(number)) {
                cell.classList.add('matched');
                setTimeout(() => {
                    cell.classList.remove('matched');
                    updateCellStatus(cell);
                }, 1000);
            }
        }
    });
    
    playChime();
});

socket.on('allCalledNumbers', (numbers) => {
    if (!Array.isArray(numbers) || !numbers.length) return;
    
    localStorage.setItem('calledNumbers', JSON.stringify(numbers));
    
    const cells = document.querySelectorAll('#bingoCard td');
    cells.forEach(cell => {
        if (cell.textContent !== 'FREE') {
            updateCellStatus(cell);
        }
    });
    
    const lastNumber = numbers[numbers.length - 1];
    if (lastNumber) {
        let letter = '';
        if (lastNumber >= 1 && lastNumber <= 15) letter = 'B';
        else if (lastNumber >= 16 && lastNumber <= 30) letter = 'I';
        else if (lastNumber >= 31 && lastNumber <= 45) letter = 'N';
        else if (lastNumber >= 46 && lastNumber <= 60) letter = 'G';
        else if (lastNumber >= 61 && lastNumber <= 75) letter = 'O';
        
        const lastCalledNumber = { number: lastNumber, letter };
        localStorage.setItem('lastCalledNumber', JSON.stringify(lastCalledNumber));
        updateCalledNumberDisplay(lastCalledNumber);
    }
});

socket.on('playerDeactivated', (deactivatedPlayerName) => {
    if (deactivatedPlayerName === currentPlayerName) {
        isPlayerActive = false;
        disableBingoCard();
        showDeactivationMessage();
    }
});

socket.on('layoutsUpdate', (layoutsData) => {
    Object.keys(layoutsData).forEach((key, index) => {
        const layoutData = layoutsData[key];
        const layoutContainerId = `layoutContainer${index + 1}`;
        const layoutContainer = document.getElementById(layoutContainerId);

        if (!layoutContainer) {
            const newContainer = document.createElement('div');
            newContainer.id = layoutContainerId;
            newContainer.className = 'bingo-layout-container';
            newContainer.innerHTML = `
                <div id="layoutTitle${index + 1}" class="bingo-layout-title">${layoutData.title || ''}</div>
                <div id="layout${index + 1}" class="bingo-layout">${layoutData.layoutHTML}</div>
            `;
            document.getElementById('bingo-layouts').appendChild(newContainer);
        } else {
            const titleElement = layoutContainer.querySelector(`#layoutTitle${index + 1}`);
            const layoutElement = layoutContainer.querySelector(`#layout${index + 1}`);

            if (titleElement) titleElement.textContent = layoutData.title || '';
            if (layoutElement) layoutElement.innerHTML = layoutData.layoutHTML;
        }

        const container = document.getElementById(layoutContainerId);
        if (layoutData.disabled) {
            container.classList.add('disabled');
            container.querySelector('.bingo-layout-title').classList.add('disabled');
        } else {
            container.classList.remove('disabled');
            container.querySelector('.bingo-layout-title').classList.remove('disabled');
        }
    });
});

socket.on('loginStatusChanged', ({ enabled }) => {
    isLoginEnabled = enabled;
    updateLoginUI();
});

socket.on('connect', () => {
    if (isPlayerActive && currentPlayerName) {
        socket.emit('requestCalledNumbers');
        socket.emit('playerActivated', currentPlayerName);
    }
});

socket.on('disconnect', () => {
    isPlayerActive = false;
});

// Initial page load setup
window.addEventListener('load', async () => {
	try {
        const response = await fetch('/loginStatus');
        const data = await response.json();
        isLoginEnabled = data.enabled;
        updateLoginUI();
        
        if (isLoginEnabled) {
            const userId = getUserId();
            const cardResponse = await fetch(`/checkExistingCard/${userId}`);
            const cardData = await cardResponse.json();
            
            if (cardData.exists && cardData.playerData) {
                document.getElementById('playerName').value = cardData.playerData.playerName;
                if (cardData.playerData.card && Array.isArray(cardData.playerData.card)) {
                    loadExistingCard(cardData.playerData);
                    
                    // After loading card, update cells with current state
                    const cells = document.querySelectorAll('#bingoCard td');
                    cells.forEach(cell => {
                        const number = parseInt(cell.textContent);
                        if (!isNaN(number)) {
                            updateCellStatus(cell);
                        }
                    });

                    // Restore last called number display if exists
                    const lastCalledNumber = JSON.parse(localStorage.getItem('lastCalledNumber'));
                    if (lastCalledNumber) {
                        updateCalledNumberDisplay(lastCalledNumber);
                    }

                    // Request fresh state from server
                    socket.emit('requestCalledNumbers');
                    socket.emit('playerActivated', cardData.playerData.playerName);
                }
            }
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

function updateLoginUI() {
    const loginSection = document.getElementById('loginSection');
    const loginMessage = document.getElementById('loginMessage') || createLoginMessage();
    
    if (isLoginEnabled) {
        loginSection.style.display = 'block';
        loginMessage.style.display = 'none';
    } else {
        loginSection.style.display = 'none';
        loginMessage.style.display = 'block';
    }
}

function createLoginMessage() {
    const message = document.createElement('div');
    message.id = 'loginMessage';
    message.className = 'login-message';
    message.innerHTML = `
        <p>Login is currently disabled by the host.</p>
        <p>Please wait for the host to enable player registration.</p>
    `;
    document.querySelector('.container').insertBefore(message, document.getElementById('loginSection'));
    return message;
}

// Function to mark numbers
function markNumber(number, playerName) {
    const userId = getUserId();
    socket.emit('markNumber', { playerName, number, userId });
}

async function checkExistingCard(userId) {
    if (!isLoginEnabled) return;
    
    try {
        const response = await fetch(`/checkExistingCard/${userId}`);
        const data = await response.json();
        if (data.exists && data.playerData) {
            document.getElementById('playerName').value = data.playerData.playerName;
            if (data.playerData.card && Array.isArray(data.playerData.card)) {
                loadExistingCard(data.playerData);
            }
        }
    } catch (error) {
        console.error('Error loading existing card:', error);
    }
}