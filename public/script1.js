// Add this to the beginning of the script section in player.html
// Function to generate a unique user ID
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Get or create user ID
function getUserId() {
    let userId = localStorage.getItem('bingoUserId');
    if (!userId) {
        userId = generateUserId();
        localStorage.setItem('bingoUserId', userId);
    }
    return userId;
}

// Function to generate 25 table cells dynamically
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
        // Check if chime is enabled before playing
        const chimeToggle = document.getElementById('chimeToggle');
        if (chimeToggle.checked) {
            chimeSound.play();
        }
    }
	
    const socket = io();
    let playerName = '';
    let currentPlayerName = '';

    socket.on('displayCalledNumber', (number) => {
        if (number >= 1 && number <= 15) {
            document.getElementById('calledNumber').textContent = `B ${number}`;
        } else if (number >= 16 && number <= 30) {
            document.getElementById('calledNumber').textContent = `I ${number}`;
        } else if (number >= 31 && number <= 45) {
            document.getElementById('calledNumber').textContent = `N ${number}`;
        } else if (number >= 46 && number <= 60) {
            document.getElementById('calledNumber').textContent = `G ${number}`;
        } else if (number >= 61 && number <= 75) {
            document.getElementById('calledNumber').textContent = `O ${number}`;
        }
  
        // Find and flash matching cells
        const cells = document.querySelectorAll('#bingoCard td');
        cells.forEach(cell => {
            if (parseInt(cell.textContent) === number) {
                cell.classList.add('matched');
                
                // Remove the matched class after animation completes
                setTimeout(() => {
                    cell.classList.remove('matched');
                }, 1000);
            }
        });
	
        playChime();
    });
	
socket.on('layoutsUpdate', (layoutsData) => {
    console.log('Received layoutsUpdate:', layoutsData); // Debugging

    Object.keys(layoutsData).forEach((key, index) => {
        const layoutData = layoutsData[key];
        const layoutContainerId = `layoutContainer${index + 1}`;
        const layoutContainer = document.getElementById(layoutContainerId);

        // Create the layout container if it doesn't exist
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
            // Update existing layout container
            const titleElement = layoutContainer.querySelector(`#layoutTitle${index + 1}`);
            const layoutElement = layoutContainer.querySelector(`#layout${index + 1}`);

            if (titleElement) titleElement.textContent = layoutData.title || '';
            if (layoutElement) layoutElement.innerHTML = layoutData.layoutHTML;
        }

        // Apply or remove the 'disabled' class
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






function generateCard() {
    const userId = getUserId();
    const playerNameInput = document.getElementById('playerName');
    const enteredName = playerNameInput.value.trim();

    if (!enteredName) {
        alert('Please enter your name');
        return;
    }
 // Check if username already exists
    fetch(`/checkUsername/${encodeURIComponent(enteredName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                // Show error message
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

            // Clear any existing error message
            const errorMsg = document.getElementById('usernameError');
            if (errorMsg) {
                errorMsg.remove();
            }
            playerNameInput.style.borderColor = '';

            currentPlayerName = enteredName;
            playerName = enteredName;

            // Play chime if enabled
            chimeSound.play();

            // Show chime toggle
            const chimeToggleContainer = document.getElementById('chimeToggleContainer');
            chimeToggleContainer.classList.add('visible');
            
            // Check if user already has a card
            fetch(`/checkExistingCard/${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.exists) {
                        // Load existing card
                        loadExistingCard(data.playerData);
                    } else {
                        // Generate new card
                        createNewCard(userId, playerName);
                    }
                })
                .catch(error => console.error('Error:', error));
        })
        .catch(error => {
            console.error('Error checking username:', error);
            alert('An error occurred while checking the username. Please try again.');
        });
}

//---------
function loadExistingCard(playerData) {
    // Update player name display
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('playerNameDisplay').textContent = `${playerData.playerName}'s Bingo Card`;
    document.getElementById('playerNameDisplay').style.display = 'block'; // Ensure visibility
    
    // Show controls
    document.getElementById('chimeToggleContainer').classList.add('visible');
    
    // Recreate the card
    const table = document.getElementById('bingoCard');
    table.innerHTML = ''; // Clear existing content
    table.style.display = 'table'; // Ensure table is visible
    
    // Add header row
    const headerRow = table.insertRow();
    ['B', 'I', 'N', 'G', 'O'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Populate card with numbers and marked status
    for (let i = 0; i < 5; i++) {
        const row = table.insertRow();
        for (let j = 0; j < 5; j++) {
            const cell = row.insertCell();
            const number = playerData.card[i][j];
            cell.textContent = number;

            // Apply appropriate styling and handling
            if (number === 'FREE') {
                cell.classList.add('free-cell');
                cell.onclick = null; // Disable clicking for FREE cell
            } else {
                // Check if number was previously marked
                if (playerData.markedNumbers && playerData.markedNumbers.includes(number)) {
                    cell.classList.add('marked');
                }
                // Add click handler
                cell.onclick = function() {
                    this.classList.toggle('marked');
                    markNumber(number, playerData.playerName);
                };
            }
            
            // Ensure cell is visible
            cell.style.display = 'table-cell';
        }
    }

    // Store current player name
    currentPlayerName = playerData.playerName;
    playerName = playerData.playerName;
}


//---------	

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
    const table = document.getElementById('bingoCard');
    table.innerHTML = '';

        // Add header row
        const headerRow = table.insertRow();
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        for (let i = 0; i < 5; i++) {
            const row = table.insertRow();
            for (let j = 0; j < 5; j++) {
                const cell = row.insertCell();
                cell.textContent = card[i][j];

                // Special handling for FREE cell
                if (card[i][j] === 'FREE') {
                    cell.classList.add('free-cell');
                    cell.onclick = null; // Disable clicking
                } else {
                    cell.onclick = function () {
                        this.classList.toggle('marked');
                        markNumber(card[i][j], playerName);
                    };
                }
            }
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

// Modified markNumber function
function markNumber(number, playerName) {
    const userId = getUserId();
    socket.emit('markNumber', { playerName, number, userId });
}
// Update the fetch handler in the load event listener
window.addEventListener('load', () => {
    const userId = getUserId();
    fetch(`/checkExistingCard/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists && data.playerData) {
                document.getElementById('playerName').value = data.playerData.playerName;
                // Ensure we have valid card data before loading
                if (data.playerData.card && Array.isArray(data.playerData.card)) {
                    loadExistingCard(data.playerData);
                } else {
                    console.error('Invalid card data received:', data.playerData);
                }
            }
        })
        .catch(error => {
            console.error('Error loading existing card:', error);
        });
});
   