function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content and mark tab as active
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}
// Function to toggle menu visibility
function toggleMenu() {
    const menuItems = document.getElementById("menuItems");
    menuItems.style.display = menuItems.style.display === "block" ? "none" : "block";
}
// Function to close the menu
function closeMenu() {
    const menuItems = document.getElementById("menuItems");
    menuItems.style.display = "none";
}

// Function to show the About message
function showAbout() {
    alert("This is the About section. You can add information about your website or application here.");
}

// Function to show the Contact message
function showContact() {
    alert("This is the Contact section. You can add contact details or a contact form here.");
}

// Function to hide the menu if clicking outside
document.addEventListener("click", function (event) {
    const menuIcon = document.querySelector(".menu-icon");
    const menuItems = document.getElementById("menuItems");

    // Check if the click is outside the menu and menu icon
    if (!menuItems.contains(event.target) && !menuIcon.contains(event.target)) {
        closeMenu();
    }
});
		    // Add event listener for the Enter key on the password input
    document.getElementById('password-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            authenticateUser();  // Call authenticateUser if Enter is pressed
        }
    });
	class SimpleAuth {
            constructor() {
                // Hardcoded correct password
                this.CORRECT_PASSWORD = "Admin2025";
            }

            // Simple authentication method
            authenticate(password) {
                // Direct password comparison
                return password === this.CORRECT_PASSWORD;
            }
        }

        // Initialize authentication
        const simpleAuth = new SimpleAuth();

        // Authentication handler
        function authenticateUser() {
            const passwordInput = document.getElementById('password-input');
            const errorMessage = document.getElementById('error-message');
            const loginContainer = document.getElementById('login-container');
            const mainContent = document.getElementById('main-content');

            // Attempt to authenticate
            if (simpleAuth.authenticate(passwordInput.value)) {
                // Hide login, show content
                loginContainer.style.display = 'none';
                mainContent.style.display = 'block';
            } else {
                // Show error message
                errorMessage.textContent = "Incorrect password. Please try again.";
                passwordInput.value = '';
            }
        }

        // Check authentication on page load
        window.onload = function() {
            const loginContainer = document.getElementById('login-container');
            const mainContent = document.getElementById('main-content');

            // Always show login screen
            loginContainer.style.display = 'flex';
            mainContent.style.display = 'none';
        };
		const socket = io();
	        const board = document.getElementById('bingoBoard');
        const letters = ['B', 'I', 'N', 'G', 'O'];
        let lastCalledCell = null;
        let calledNumbers = new Set();
        const shuffleSound = new Audio('shuffle.mp3');


function createBoard() {
    for (let row = 0; row < letters.length; row++) {
        for (let col = 0; col < 16; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (col === 0) {
                cell.classList.add('header');
                cell.textContent = letters[row];
            } else {
                const number = row * 15 + col;
                if (number <= 75) {
                    cell.textContent = number;
                    cell.id = `${letters[row]}${number}`;
                    cell.addEventListener('click', () => handleCellClick(number));
                }
            }
            board.appendChild(cell);
        }
    }
	createBingoLayouts();
}

       function createBingoLayouts() {
            const layouts = document.querySelectorAll('.bingo-layout');
            layouts.forEach((layout, index) => {
                for (let i = 0; i < 25; i++) {
                    const cell = document.createElement('div');
                    cell.className = 'bingo-layout-cell';
                    
                    // Handle special initial highlighting
                    if (index === 2) {
                        // Third Prize layout: highlight all cells
                        cell.classList.add('highlighted');
                    } else if (index === 0) {
                        // Second Prize layout: highlight center column
                        const centerColumnIndexes = [2, 7, 12, 17, 22];
                        if (centerColumnIndexes.includes(i)) {
                            cell.classList.add('highlighted');
                        }
                    }
					else if (index === 1) {
                        // Second Prize layout: highlight center column
                        const centerColumnIndexes = [0, 4, 6, 8, 12, 16, 18, 20, 24];
                        if (centerColumnIndexes.includes(i)) {
                            cell.classList.add('highlighted');
                        }
                    }					
                    
                    // Free space
                    cell.textContent = i === 12 ? 'FREE' : '';
                    
                    cell.addEventListener('click', () => {
                        const layoutContainer = layout.closest('.bingo-layout-container');
                        if (!layoutContainer.classList.contains('disabled')) {
                            cell.classList.toggle('highlighted');
                        }
                    });
                    
                    layout.appendChild(cell);
                }
            });

const layoutTitles = document.querySelectorAll('.bingo-layout-title');

layoutTitles.forEach((title) => {
    title.addEventListener('click', () => {
        const layoutContainer = title.closest('.bingo-layout-container');
        const isDisabled = layoutContainer.classList.toggle('disabled');
        title.classList.toggle('disabled', isDisabled);

        // Check if layout is disabled and update UI
        if (isDisabled) {
            createWinnerInput(layoutContainer);
        } else {
            removeWinnerDisplay(layoutContainer);
        }

        // Send updated layouts to the server
        const updatedLayouts = {
            layout1: {
                title: document.querySelector('#layoutTitle1').textContent,
                layoutHTML: document.querySelector('#layout1').innerHTML,
                disabled: document.getElementById('layoutContainer1').classList.contains('disabled'),
            },
            layout2: {
                title: document.querySelector('#layoutTitle2').textContent,
                layoutHTML: document.querySelector('#layout2').innerHTML,
                disabled: document.getElementById('layoutContainer2').classList.contains('disabled'),
            },
            layout3: {
                title: document.querySelector('#layoutTitle3').textContent,
                layoutHTML: document.querySelector('#layout3').innerHTML,
                disabled: document.getElementById('layoutContainer3').classList.contains('disabled'),
            },
        };

        socket.emit('updateLayouts', updatedLayouts);
    });
});

}

// Add this to your script.js file

function createAlertDialog() {
    // Create the alert container if it doesn't exist
    let alertContainer = document.getElementById('custom-alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'custom-alert-container';
        document.body.appendChild(alertContainer);
    }
    return alertContainer;
}

function showAbout() {
    const container = createAlertDialog();
    container.innerHTML = `
        <div class="modal-overlay">
            <div class="custom-alert">
                <div class="alert-header">
                    <h2>About Mishail's Bingo</h2>
                    <button class="close-button" onclick="closeAlert()">×</button>
                </div>
                <div class="alert-content">
                    <p>Welcome to Mishail's Ultimate Bingo! This modern take on the classic game 
                    features real-time multiplayer support, customizable layouts, and an 
                    intuitive interface. Perfect for both casual players and serious bingo enthusiasts.</p>
                    <br>
                    <p>Features include:</p>
                    <ul>
                        <li>Auto-number generation</li>
                        <li>Speech synthesis support</li>
                        <li>Multiple prize layouts</li>
                        <li>Online player tracking</li>
                        <li>Mobile-friendly design</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    container.style.display = 'block';
    closeMenu();
}

function showContact() {
    const container = createAlertDialog();
    container.innerHTML = `
        <div class="modal-overlay">
            <div class="custom-alert">
                <div class="alert-header">
                    <h2>Contact Us</h2>
                    <button class="close-button" onclick="closeAlert()">×</button>
                </div>
                <div class="alert-content">
                    <p>Have questions or feedback? We likw to hear from you!</p>
                    <p><center><strong>Email:</strong> mishail.oraha@gmail.com</center></p>
                </div>
            </div>
        </div>
    `;
    container.style.display = 'block';
    closeMenu();
}

function closeAlert() {
    const container = document.getElementById('custom-alert-container');
    if (container) {
        container.style.display = 'none';
    }
}

// Close alert when clicking outside the modal
document.addEventListener('click', function(event) {
    const container = document.getElementById('custom-alert-container');
    if (container && event.target.classList.contains('modal-overlay')) {
        closeAlert();
    }
});
function createWinnerInput(layoutContainer) {
    // Create an input box if it doesn't exist for this layout
    let inputBox = layoutContainer.querySelector('.winner-input');
    if (!inputBox) {
        inputBox = document.createElement('input');
        inputBox.type = 'text';
        inputBox.className = 'winner-input';
        inputBox.placeholder = 'Enter Winner Name';
        layoutContainer.appendChild(inputBox);
        inputBox.focus();

        // Handle winner input submission
        inputBox.addEventListener('keydown', function onEnter(event) {
            if (event.key === 'Enter') {
                const winnerName = inputBox.value.trim();
                if (winnerName) {
                    createWinnerDisplay(layoutContainer, winnerName);
                }
                removeWinnerInput(layoutContainer);
            }
        });
    }
}

function createWinnerDisplay(layoutContainer, winnerName) {
    let winnerDisplay = document.createElement('div');
    winnerDisplay.className = 'winner-display draggable';
    winnerDisplay.textContent = winnerName;
    layoutContainer.appendChild(winnerDisplay);

    // Center the winner's name initially
    winnerDisplay.style.position = 'absolute';
    winnerDisplay.style.top = `${layoutContainer.offsetTop}px`;
    winnerDisplay.style.left = `${layoutContainer.offsetLeft}px`;

    // Make the div draggable
    makeDraggable(winnerDisplay);
}

function removeWinnerInput(layoutContainer) {
    const inputBox = layoutContainer.querySelector('.winner-input');
    if (inputBox) {
        inputBox.remove();
    }
}

function removeWinnerDisplay(layoutContainer) {
    const winnerDisplay = layoutContainer.querySelector('.winner-display');
    if (winnerDisplay) {
        winnerDisplay.remove();
    }
    removeWinnerInput(layoutContainer);
}

function makeDraggable(element) {
    let offsetX = 0, offsetY = 0, mouseX = 0, mouseY = 0;

    element.onmousedown = function (e) {
        e.preventDefault();
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.onmousemove = dragElement;
        document.onmouseup = stopDragging;
    };

    function dragElement(e) {
        e.preventDefault();
        offsetX = mouseX - e.clientX;
        offsetY = mouseY - e.clientY;
        mouseX = e.clientX;
        mouseY = e.clientY;

        element.style.top = (element.offsetTop - offsetY) + "px";
        element.style.left = (element.offsetLeft - offsetX) + "px";
    }

    function stopDragging() {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}


        

function handleCellClick(number) {
    if (calledNumbers.has(number)) {
        const letter = letters[Math.floor((number - 1) / 15)];
        if (confirm(`Are you sure you want to recall number ${letter}${number}?`)) {
            undoNumber(number);
        }
    }
}
function undoNumber(number) {
    if (!calledNumbers.has(number)) return;

    calledNumbers.delete(number);
    let letter = letters[Math.floor((number - 1) / 15)];
    const cell = document.getElementById(`${letter}${number}`);
    cell.classList.remove('called', 'flashing-called');

    // Update the called balls display
    updateCalledNumbers();

    // Speak the undone number if speech is enabled
    speakNumber(`Recalled ${letter}. ${number} successfully.`);
}

        function callNumber(number) {
            if (number < 1 || number > 75) {
                alert('Please enter a number between 1 and 75.');
                return;
            }
            if (calledNumbers.has(number)) {
                alert(`The number ${number} has already been called.`);
                return;
            }
            calledNumbers.add(number);
            let letter = letters[Math.floor((number - 1) / 15)];
            const cell = document.getElementById(`${letter}${number}`);
            if (lastCalledCell) {
                lastCalledCell.classList.remove('flashing-called');
            }
            cell.classList.add('called', 'flashing-called');
            lastCalledCell = cell;
            updateCalledNumbers(`${letter} ${number}`);
            speakNumber(`${letter}. ${number}`);
			 socket.emit('numberCalled', number);
        }

        let isGenerating = false;

        function speakNumber(number) {
            const speakCheckbox = document.getElementById('speakCheckbox');
            if (speakCheckbox.checked && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(number);
                utterance.lang = 'en-US';
                utterance.rate = 0.6;
                utterance.pitch = 1.5;
                window.speechSynthesis.speak(utterance);
            }
        }
		
		function updateCalledNumbers() {
    const calledNumbersArray = Array.from(calledNumbers).reverse();
    const lastBalls = [
        document.getElementById('lastBall4'),
        document.getElementById('lastBall3'),
        document.getElementById('lastBall2'),
        document.getElementById('lastBall1')
    ];

    for (let i = 0; i < lastBalls.length; i++) {
        if (i < calledNumbersArray.length) {
            const number = calledNumbersArray[i];
            const letter = letters[Math.floor((number - 1) / 15)];
            lastBalls[i].textContent = `${letter}${number}`;
        } else {
            lastBalls[i].textContent = '';
        }
    }

    const calledBall = document.getElementById('calledBall');
    if (calledNumbersArray.length > 0) {
        const number = calledNumbersArray[0];
        const letter = letters[Math.floor((number - 1) / 15)];
        calledBall.textContent = `${letter}${number}`;
    } else {
        calledBall.textContent = '';
    }
}

        function generateRandomNumber() {
            if (isGenerating) return;
            if (calledNumbers.size >= 75) {
                alert('All numbers have been called.');
                return;
            }
            isGenerating = true;
            flashBoard();
            setTimeout(() => {
                let randomNumber;
                do {
                    randomNumber = Math.floor(Math.random() * 75) + 1;
                } while (calledNumbers.has(randomNumber));
                callNumber(randomNumber);
                isGenerating = false;
            }, 3000);
        }

        function flashBoard() {
            if (speakCheckbox.checked) {
                shuffleSound.play();
            }
            const cells = document.querySelectorAll('.cell:not(.called):not(.header)');
            const flashInterval = setInterval(() => {
                const randomCells = [];
                while (randomCells.length < 10) {
                    const randomCell = cells[Math.floor(Math.random() * cells.length)];
                    if (!randomCells.includes(randomCell)) {
                        randomCells.push(randomCell);
                        randomCell.classList.add('flashing-random');
                        setTimeout(() => randomCell.classList.remove('flashing-random'), 300);
                    }
                }
            }, 100);
            setTimeout(() => {
                clearInterval(flashInterval);
                shuffleSound.pause();
                shuffleSound.currentTime = 0;
            }, 3000);
        }

        function updateCalledNumbers(newNumber) {
    const lastBalls = [
        document.getElementById('lastBall4'),
        document.getElementById('lastBall3'),
        document.getElementById('lastBall2'),
        document.getElementById('lastBall1')
    ];
    for (let i = lastBalls.length - 1; i > 0; i--) {
        lastBalls[i].textContent = lastBalls[i - 1].textContent || '';
    }
    lastBalls[0].textContent = document.getElementById('calledBall').textContent;
    document.getElementById('calledBall').textContent = newNumber;
}

document.getElementById('generateButton').addEventListener('click', generateRandomNumber);
document.getElementById('numberInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const number = parseInt(this.value);
        if (!isNaN(number)) callNumber(number);
        this.value = '';
    }
});

createBoard();

const enableDataCheckbox = document.getElementById('enableDataCheckbox');
const playerList = document.getElementById('playerList');

enableDataCheckbox.addEventListener('change', () => {
    if (enableDataCheckbox.checked) {
        startFetchingPlayerData(); // Start periodic fetching
		playerList.style.display = 'block'; // Show the player list
    } else {
        stopFetchingPlayerData(); // Stop periodic fetching
		playerList.style.display = 'none'; // Hide the player list
        clearPlayerCards(); // Optional: clear existing data
    }
});

let fetchInterval = null;

function startFetchingPlayerData() {
    if (!fetchInterval) {
        fetchInterval = setInterval(fetchPlayerCards, 5000); // Fetch every 5 seconds
    }
}

function stopFetchingPlayerData() {
    if (fetchInterval) {
        clearInterval(fetchInterval);
        fetchInterval = null;
    }
}

function clearPlayerCards() {
    const playerList = document.getElementById('playerCards');
    playerList.innerHTML = ''; // Clear all displayed data
}


//--------------------------------
// Function to create a bingo card table with marked numbers
function createBingoCardTable(card, playerName) {
    const table = document.createElement('table');
    table.className = 'bingo-table';
    table.setAttribute('data-player', playerName);

    // Add header row
    const headerRow = table.insertRow();
    ['B', 'I', 'N', 'G', 'O'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Find player's marked numbers from the server data
    const playerData = playerCards.find(p => p.playerName === playerName);
    const markedNumbers = playerData?.markedNumbers || [];

    // Populate Bingo card numbers
    for (let i = 0; i < 5; i++) {
        const row = table.insertRow();
        for (let j = 0; j < 5; j++) {
            const cell = row.insertCell();
            const number = card[i][j];
            
            // Handle the center FREE space
            if (i === 2 && j === 2) {
                cell.textContent = 'FREE';
                cell.classList.add('free-space', 'marked');  // Add both classes
            } else {
                cell.textContent = number;
                cell.setAttribute('data-number', number);
                
                // Mark the cell if the number is in markedNumbers
                if (markedNumbers.includes(number)) {
                    cell.classList.add('marked');
                }
            }
        }
    }

    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.style.marginLeft = '10px';
    removeButton.style.fontWeight = 'bold';
    removeButton.onclick = () => removePlayerCard(playerName);

    // Create a container for player name and button
    const playerHeader = document.createElement('div');
    playerHeader.textContent = playerName;
    playerHeader.style.flex = '1';
    playerHeader.style.textAlign = 'center';
    playerHeader.style.fontWeight = 'bold';
    playerHeader.appendChild(removeButton);

    // Create a container for the entire player card
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player-card';
    playerDiv.setAttribute('data-player', playerName);
    
    // Append header and table to the player div
    playerDiv.appendChild(playerHeader);
    playerDiv.appendChild(table);

    return playerDiv;
}

function createResetButton() {
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset All Players';
  resetButton.id = 'resetAllPlayers';
  resetButton.onclick = removeAllPlayerCards;
  
  const playerList = document.getElementById('playerList');
  playerList.insertBefore(resetButton, playerList.firstChild);
}

function removeAllPlayerCards() {
  const playerCards = document.querySelectorAll('.player-card');
  playerCards.forEach(card => {
    const playerName = card.getAttribute('data-player');
    removePlayerCard(playerName);
  });
}

// Call this function after the player list tab is created
createResetButton();

function removePlayerCard(playerName) {
    // First, remove the player from the server
    removePlayerFromServer(playerName);
}

function removePlayerFromServer(playerName) {
    fetch(`/removePlayer/${playerName}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message); // Log success message
        // Now remove from display only if successfully removed from server
        const playerCard = document.querySelector(`.player-card[data-player="${playerName}"]`);
        if (playerCard) {
            playerCard.remove(); // Removes the player card from the display
        }
    })
    .catch(error => console.error('Error:', error));
	closeCard(playerName);
}

function closeCard(playerName) {
  fetch(`/deactivatePlayer/${playerName}`, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      // Remove the card from the view
      const card = document.querySelector(`[data-player-name="${playerName}"]`);
      if (card) {
        card.remove();
      }
    })
    .catch(error => console.error('Error:', error));
}

// Update the fetchPlayerCards function to store the server data
function fetchPlayerCards() {
    const enableDataCheckbox = document.getElementById('enableDataCheckbox');
    if (!enableDataCheckbox.checked) {
        return;
    }
    
    fetch('/getCards')
        .then(response => response.json())
        .then(data => {
            // Store the player cards data globally
            window.playerCards = data;
            
            const playerList = document.getElementById('playerCards');
            data.forEach(player => {
                let existingCard = document.querySelector(`.player-card[data-player="${player.playerName}"]`);
                if (!existingCard) {
                    let playerDiv = createBingoCardTable(player.card, player.playerName);
                    playerList.appendChild(playerDiv);
                } else {
                    // Update existing card's marked numbers
                    player.markedNumbers?.forEach(number => {
                        const cell = existingCard.querySelector(`td[data-number="${number}"]`);
                        if (cell && !cell.classList.contains('marked')) {
                            cell.classList.add('marked');
                        }
                    });
                }
            });
        })
        .catch(error => console.error('Error fetching player cards:', error));
}

// Update the number marking function
function updatePlayerCard(playerName, number) {
    const playerCard = document.querySelector(`[data-player="${playerName}"]`);
    if (playerCard) {
        const cell = playerCard.querySelector(`td[data-number="${number}"]`);
        if (cell) {
            cell.classList.toggle('marked');
            
            // Update the playerCards array in memory
            const player = window.playerCards?.find(p => p.playerName === playerName);
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
        }
    }
}

      
        setInterval(fetchPlayerCards, 5000);

        socket.on('numberMarked', ({ playerName, number }) => {
            updatePlayerCard(playerName, number);
        });
		
		function sendLayoutsToServer() {
    const updatedLayouts = {
        layout1: {
            title: document.querySelector('#layoutTitle1').textContent,
            layoutHTML: document.querySelector('#layout1').innerHTML,
        },
        layout2: {
            title: document.querySelector('#layoutTitle2').textContent,
            layoutHTML: document.querySelector('#layout2').innerHTML,
        },
        layout3: {
            title: document.querySelector('#layoutTitle3').textContent,
            layoutHTML: document.querySelector('#layout3').innerHTML,
        },
    };

    socket.emit('updateLayouts', updatedLayouts);
}

// Call sendLayoutsToServer whenever layouts or titles are modified
document.querySelectorAll('.bingo-layout-container').forEach(container => {
    container.addEventListener('click', sendLayoutsToServer); // Detect changes in layouts
});

document.querySelectorAll('.bingo-layout-title').forEach(title => {
    title.addEventListener('input', sendLayoutsToServer); // Detect changes in titles
});
