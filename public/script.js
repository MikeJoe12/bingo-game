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

    saveGameState();
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
    showInfo("Welcome to Mishail's Ultimate Bingo! This modern take on the classic game features real-time multiplayer support, customizable layouts, and intuitive interface. Perfect for both casual players and serious bingo enthusiasts.", 'About Bingo');
}

// Function to show the Contact message
function showContact() {
    showInfo("Have questions or feedback? I like to hear from you! Email:mishail.oraha@gmail.com", 'Contact Developer');
}

// State management functions
function saveGameState() {
    const state = {
        calledNumbers: Array.from(calledNumbers),
        layouts: {
            layout1: {
                title: document.querySelector('#layoutTitle1').textContent,
                disabled: document.getElementById('layoutContainer1').classList.contains('disabled'),
                winner: document.querySelector('#layoutContainer1 .winner-display')?.textContent || '',
                highlightedCells: Array.from(document.querySelectorAll('#layout1 .highlighted')).map(cell =>
                    Array.from(cell.parentElement.children).indexOf(cell))
            },
            layout2: {
                title: document.querySelector('#layoutTitle2').textContent,
                disabled: document.getElementById('layoutContainer2').classList.contains('disabled'),
                winner: document.querySelector('#layoutContainer2 .winner-display')?.textContent || '',
                highlightedCells: Array.from(document.querySelectorAll('#layout2 .highlighted')).map(cell =>
                    Array.from(cell.parentElement.children).indexOf(cell))
            },
            layout3: {
                title: document.querySelector('#layoutTitle3').textContent,
                disabled: document.getElementById('layoutContainer3').classList.contains('disabled'),
                winner: document.querySelector('#layoutContainer3 .winner-display')?.textContent || '',
                highlightedCells: Array.from(document.querySelectorAll('#layout3 .highlighted')).map(cell =>
                    Array.from(cell.parentElement.children).indexOf(cell))
            }
        },
        settings: {
            speechEnabled: document.getElementById('speakCheckbox').checked,
            onlineEnabled: document.getElementById('enableDataCheckbox').checked
        },
        lastCalledNumbers: [
            document.getElementById('calledBall').textContent,
            document.getElementById('lastBall4').textContent,
            document.getElementById('lastBall3').textContent,
            document.getElementById('lastBall2').textContent,
            document.getElementById('lastBall1').textContent
        ].filter(n => n),
        currentTab: document.querySelector('.tab.active')?.getAttribute('data-tab') || 'game-tab'
    };
    localStorage.setItem('bingoGameState', JSON.stringify(state));
}

function loadGameState() {
    const savedState = localStorage.getItem('bingoGameState');
    if (!savedState) return false;

    const state = JSON.parse(savedState);

    // Restore called numbers
    calledNumbers = new Set(state.calledNumbers);
    state.calledNumbers.forEach(number => {
        const letter = letters[Math.floor((number - 1) / 15)];
        const cell = document.getElementById(`${letter}${number}`);
        if (cell) cell.classList.add('called');
    });
	updateCalledNumbers();

    // Restore layouts state
    Object.entries(state.layouts).forEach(([layoutId, layoutState]) => {
        const container = document.getElementById(layoutId.replace('layout', 'layoutContainer'));
        if (layoutState.disabled) {
            container.classList.add('disabled');
            if (layoutState.winner) {
                createWinnerDisplay(container, layoutState.winner);
            }
        }

        // Restore highlighted cells
        const layout = document.getElementById(layoutId);
        const cells = layout.getElementsByClassName('bingo-layout-cell');
        layoutState.highlightedCells.forEach(index => {
            if (cells[index]) cells[index].classList.add('highlighted');
        });
    });

    // Restore settings
    document.getElementById('speakCheckbox').checked = state.settings.speechEnabled;
    document.getElementById('enableDataCheckbox').checked = state.settings.onlineEnabled;
    if (state.settings.onlineEnabled) {
        startFetchingPlayerData();
        document.getElementById('playerList').style.display = 'block';
        document.getElementById('qrCode').style.display = 'block';
    }

 if (state.lastCalledNumbers.length > 0) {
        const lastNumbers = state.lastCalledNumbers;
        
        // Update current number (calledBall)
        if (lastNumbers[0]) {
            document.getElementById('calledBall').textContent = lastNumbers[0];
            const letter = letters[Math.floor((lastNumbers[0] - 1) / 15)];
            document.getElementById('calledBall').setAttribute('data-letter', letter);
            document.getElementById('calledBall').classList.add(`ball-${letter}`);
        }

        // Update small balls in correct order
        const smallBallIds = ['lastBall4', 'lastBall3', 'lastBall2', 'lastBall1'];
        smallBallIds.forEach((id, index) => {
            const element = document.getElementById(id);
            const number = lastNumbers[index + 1]; // Skip the first number (current ball)
            
            if (number) {
                element.textContent = number;
                const letter = letters[Math.floor((number - 1) / 15)];
                element.setAttribute('data-letter', letter);
                element.classList.add(`small-ball-${letter}`);
            } else {
                // Clear the element if no number exists
                element.textContent = '';
                element.setAttribute('data-letter', '');
                element.classList.remove('small-ball-B', 'small-ball-I', 'small-ball-N', 'small-ball-G', 'small-ball-O');
            }
        });
    }

    // Restore active tab
    if (state.currentTab) {
        switchTab(state.currentTab);
    }

    // Restore layout titles
    document.querySelector('#layoutTitle1').textContent = savedState.layouts.layout1.title;
    document.querySelector('#layoutTitle2').textContent = savedState.layouts.layout2.title;
    document.querySelector('#layoutTitle3').textContent = savedState.layouts.layout3.title;

    // Restore winners
    if (savedState.layouts.layout1.winner) {
        createWinnerDisplay(document.getElementById('layoutContainer1'), savedState.layouts.layout1.winner);
    }
    if (savedState.layouts.layout2.winner) {
        createWinnerDisplay(document.getElementById('layoutContainer2'), savedState.layouts.layout2.winner);
    }
    if (savedState.layouts.layout3.winner) {
        createWinnerDisplay(document.getElementById('layoutContainer3'), savedState.layouts.layout3.winner);
    }

    return true;
}

// Function to hide the menu if clicking outside
document.addEventListener("click", function(event) {
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
        authenticateUser(); // Call authenticateUser if Enter is pressed
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
    // const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');

    //createBoard();
    const stateLoaded = loadGameState();

    // If state was loaded successfully, skip login
    if (stateLoaded) {
        document.getElementById('login-container').style.display = 'none';
        mainContent.style.display = 'block';
    } else {
        document.getElementById('login-container').style.display = 'flex';
        mainContent.style.display = 'none';
    }
};
const socket = io();
const board = document.getElementById('bingoBoard');
const letters = ['B', 'I', 'N', 'G', 'O'];
let lastCalledCell = null;
let calledNumbers = new Set();
const shuffleSound = new Audio('shuffle.mp3');
const shuffleSound1 = new Audio('applause.mp3');

function resetGame() {
    showConfirm(
        "Confirm Reset Game",
        "Are you sure you want to reset the game? This will clear all called numbers and layout states?",
        () => {
            // Reset all game state variables
            calledNumbers = new Set();
            currentNumber = null;
            previousNumbers = [];
            lastCalledCell = null;

            // Clear ball displays
            updateCalledBall(null);
            ['lastBall1', 'lastBall2', 'lastBall3', 'lastBall4'].forEach(id => {
                updateBallDisplay(document.getElementById(id), null);
            });

            // Clear board cells
            document.querySelectorAll('.cell.called, .cell.flashing-called').forEach(cell => {
                cell.classList.remove('called', 'flashing-called');
                cell.style.backgroundColor = '';
                cell.removeAttribute('data-letter');
            });

            // Reset layouts
            document.querySelectorAll('.bingo-layout-container').forEach(container => {
                container.classList.remove('disabled');
                const winnerDisplay = container.querySelector('.winner-display');
                if (winnerDisplay) {
                    winnerDisplay.remove();
                }
            });
            resetLayouts();

            // Reset player cards if online mode is enabled
            resetAllPlayerCards();

            // Reset settings to default
            document.getElementById('speakCheckbox').checked = false;
            const enableDataCheckbox = document.getElementById('enableDataCheckbox');
            if (enableDataCheckbox.checked) {
                enableDataCheckbox.checked = false;
                const event = new Event('change');
                enableDataCheckbox.dispatchEvent(event);
            }

            // Switch back to game tab
            switchTab('game-tab');

            // Clear local storage completely
            localStorage.removeItem('bingoGameState');

            // Update server state
            sendLayoutsToServer();

            // Force update all displays
            updateCalledNumbers();
        }
    );
}

function createBoard() {
    const letters = ['B', 'I', 'N', 'G', 'O'];
    for (let row = 0; row < letters.length; row++) {
        for (let col = 0; col < 16; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (col === 0) {
                cell.classList.add('header');
                cell.classList.add(`header-${letters[row]}`); // Add unique class for each header
                cell.textContent = letters[row];
            } else {
                const number = row * 15 + col;
                if (number <= 75) {
                    cell.textContent = number;
                    cell.id = `${letters[row]}${number}`;
                    cell.classList.add(`cell-${letters[row]}`); // Add class for column color
                    cell.addEventListener('click', () => handleCellClick(number));
                }
            }
            board.appendChild(cell);
        }
    }
    createBingoLayouts();
    sendLayoutsToServer();
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
            } else if (index === 1) {
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
                    saveGameState(); // Save state after cell toggle
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

    document.querySelectorAll('.bingo-layout-title').forEach(title => {
        title.addEventListener('click', () => {
            setTimeout(saveGameState, 100); // Save state after layout changes
        });
    });
}

// Add state management to settings changes
document.getElementById('speakCheckbox')?.addEventListener('change', saveGameState);
document.getElementById('enableDataCheckbox')?.addEventListener('change', saveGameState);

function UpdateLayoutOnServer() {
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

}

function resetLayouts() {
    const layoutTitles = document.querySelectorAll('.bingo-layout-title');
    const layoutContainers = document.querySelectorAll('.bingo-layout-container');

    layoutTitles.forEach((title) => {
        title.classList.remove('disabled');
        title.style.color = ''; // Reset color
        title.style.textDecoration = ''; // Remove strikethrough
    });

    layoutContainers.forEach((container) => {
        container.classList.remove('disabled');
        removeWinnerDisplay(container);
    });

    const updatedLayouts = {
        layout1: {
            title: document.querySelector('#layoutTitle1').textContent,
            layoutHTML: document.querySelector('#layout1').innerHTML,
            disabled: false,
        },
        layout2: {
            title: document.querySelector('#layoutTitle2').textContent,
            layoutHTML: document.querySelector('#layout2').innerHTML,
            disabled: false,
        },
        layout3: {
            title: document.querySelector('#layoutTitle3').textContent,
            layoutHTML: document.querySelector('#layout3').innerHTML,
            disabled: false,
        },
    };

    socket.emit('updateLayouts', updatedLayouts);
}

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
    saveGameState();
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
    saveGameState();
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
    let offsetX = 0,
        offsetY = 0,
        mouseX = 0,
        mouseY = 0;

    element.onmousedown = function(e) {
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
        showConfirm(
            "Confirm Recalled Number",
            `Are you sure you want to recall number ${letter}${number}?`,
            () => {
                undoNumber(number);
            }
        );
    } else {
        handleNewNumber(number);
        callNumber(number);

    }
}

function undoNumber(number) {
    if (!calledNumbers.has(number)) return;

    // Remove the number from calledNumbers set
    calledNumbers.delete(number);

    // Remove visual marking from the board
    let letter = letters[Math.floor((number - 1) / 15)];
    const cell = document.getElementById(`${letter}${number}`);
    cell.classList.remove('called', 'flashing-called');

    // Get all currently called numbers in reverse chronological order
    const calledNumbersArray = Array.from(calledNumbers).reverse();

    // Update the displays
    if (calledNumbersArray.length === 0) {
        // If no numbers left, clear everything
        updateCalledBall(null);
        ['lastBall1', 'lastBall2', 'lastBall3', 'lastBall4'].forEach(id => {
            updateBallDisplay(document.getElementById(id), null);
        });
    } else {
        // Update main ball with the most recent number
        updateCalledBall(calledNumbersArray[0]);

        // Update small balls in sequence (shift left)
        const smallBalls = ['lastBall4', 'lastBall3', 'lastBall2', 'lastBall1'];
        smallBalls.forEach((id, index) => {
            const ballNumber = calledNumbersArray[index + 1]; // +1 because index 0 is now the main ball
            updateBallDisplay(document.getElementById(id), ballNumber);
        });
    }

    // Speak the undone number if speech is enabled
    speakNumber(`Recalled ${letter}. ${number} successfully.`);

    // Update current number and previous numbers arrays
    currentNumber = calledNumbersArray[0] || null;
    previousNumbers = calledNumbersArray.slice(1, 5);

    // Save the game state
    saveGameState();
}
//const originalCallNumber = callNumber;

function callNumber(number) {
    if (number < 1 || number > 75) {
        showError("Please enter a number between 1 and 75.");
        return;
    }
    if (calledNumbers.has(number)) {

        showError(`The number ${number} has already been called.`);
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
    // updateCalledNumbers(`${letter} ${number}`);
    speakNumber(`${letter}. ${number}`);
    socket.emit('numberCalled', number);
    saveGameState();

    // Call the original function first
    //    originalCallNumber.call(this, number);

    // Then check for winners
    if (window.playerCards) {
        window.playerCards.forEach(playerData => {
            const winInfo = checkWinningPatterns(playerData.card, playerData.markedNumbers);
            if (winInfo) {
                handleWinner(winInfo);
            }
        });
    }

}

// Add this helper function to check for any line (horizontal or vertical)
function checkForLine(cardNumbers, markedNumbers) {
    // Check horizontal lines
    for (let row = 0; row < 5; row++) {
        let lineComplete = true;
        for (let col = 0; col < 5; col++) {
            const index = row * 5 + col;
            // Skip FREE space in center
            if (index === 12) continue;
            if (!markedNumbers.includes(cardNumbers[index])) {
                lineComplete = false;
                break;
            }
        }
        if (lineComplete) return true;
    }

    // Check vertical lines
    for (let col = 0; col < 5; col++) {
        let lineComplete = true;
        for (let row = 0; row < 5; row++) {
            const index = row * 5 + col;
            // Skip FREE space in center
            if (index === 12) continue;
            if (!markedNumbers.includes(cardNumbers[index])) {
                lineComplete = false;
                break;
            }
        }
        if (lineComplete) return true;
    }

    return false;
}

// Update the checkWinningPatterns function to handle player name correctly
function checkWinningPatterns(playerCard, markedNumbers) {
    // Find the player's name
    const player = window.playerCards?.find(p =>
        p.card.toString() === playerCard.toString()
    );
    const playerName = player?.playerName;

    // Convert player's card from 2D array to 1D array for easier checking
    const cardNumbers = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            cardNumbers.push(playerCard[i][j]);
        }
    }

    // Get patterns for prizes 2 and 3 from layouts
    const layout2Cells = Array.from(document.querySelectorAll('#layout2 .highlighted'))
        .map(cell => Array.from(cell.parentElement.children).indexOf(cell));
    const layout3Cells = Array.from(document.querySelectorAll('#layout3 .highlighted'))
        .map(cell => Array.from(cell.parentElement.children).indexOf(cell));

    // Check first prize (any line)
    const layout1Container = document.getElementById('layoutContainer1');
    if (!layout1Container.classList.contains('disabled')) {
        if (checkForLine(cardNumbers, markedNumbers)) {
            return {
                pattern: document.querySelector('#layoutTitle1').textContent,
                playerName: playerName,
                layoutContainer: layout1Container
            };
        }
    }

    // Check second prize (X pattern)
    const layout2Container = document.getElementById('layoutContainer2');
    if (!layout2Container.classList.contains('disabled')) {
        const pattern2Complete = layout2Cells.every(cellIndex => {
            if (cellIndex === 12) return true;
            return markedNumbers.includes(cardNumbers[cellIndex]);
        });
        if (pattern2Complete) {
            return {
                pattern: document.querySelector('#layoutTitle2').textContent,
                playerName: playerName,
                layoutContainer: layout2Container
            };
        }
    }

    // Check third prize (full house)
    const layout3Container = document.getElementById('layoutContainer3');
    if (!layout3Container.classList.contains('disabled')) {
        const pattern3Complete = layout3Cells.every(cellIndex => {
            if (cellIndex === 12) return true;
            return markedNumbers.includes(cardNumbers[cellIndex]);
        });
        if (pattern3Complete) {
            return {
                pattern: document.querySelector('#layoutTitle3').textContent,
                playerName: playerName,
                layoutContainer: layout3Container
            };
        }
    }

    return null;
}

function handleWinner(winInfo) {
    if (!winInfo.playerName) {
        console.error('Player name is undefined:', winInfo);
        return;
    }
    shuffleSound1.play();
    // Create alert message
    const message = `BINGO!! ${winInfo.playerName} has won the ${winInfo.pattern}!`;
    showSuccess(message, 'BINGO!');

    // Disable the winning pattern layout
    winInfo.layoutContainer.classList.add('disabled');
    UpdateLayoutOnServer();
    // Create winner display
    createWinnerDisplay(winInfo.layoutContainer, winInfo.playerName);

    // Save game state
    saveGameState();

    // speak the winner announcement
    speakWinner(message);

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

function speakWinner(message) {

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = 0.6;
    utterance.pitch = 1.5;
    window.speechSynthesis.speak(utterance);
}

// Update the updateCalledNumbers function to handle empty state
function updateCalledNumbers() {
    if (calledNumbers.size === 0) {
        // Clear all ball displays when there are no called numbers
        document.getElementById('calledBall').textContent = '';
        ['lastBall1', 'lastBall2', 'lastBall3', 'lastBall4'].forEach(id => {
            const element = document.getElementById(id);
            element.textContent = '';
            element.setAttribute('data-letter', '');
            element.classList.remove('ball-B', 'ball-I', 'ball-N', 'ball-G', 'ball-O',
                'small-ball-B', 'small-ball-I', 'small-ball-N', 'small-ball-G', 'small-ball-O');
        });
        return;
    }

    const calledNumbersArray = Array.from(calledNumbers).reverse();
    const lastBalls = [
        document.getElementById('lastBall4'),
        document.getElementById('lastBall3'),
        document.getElementById('lastBall2'),
        document.getElementById('lastBall1')
    ];

    lastBalls.forEach((ball, i) => {
        if (i < calledNumbersArray.length) {
            const number = calledNumbersArray[i];
            const letter = letters[Math.floor((number - 1) / 15)];
            updateBallDisplay(ball, number);
        } else {
            updateBallDisplay(ball, null);
        }
    });

    const calledBall = document.getElementById('calledBall');
    if (calledNumbersArray.length > 0) {
        updateBallDisplay(calledBall, calledNumbersArray[0]);
    } else {
        updateBallDisplay(calledBall, null);
    }
}

function flashBoard() {
    if (speakCheckbox.checked) {
        shuffleSound.play();
    }

    const cells = document.querySelectorAll('.cell:not(.called):not(.header)');
    const maxFlashes = Math.min(cells.length, 10); // Flash only as many cells as available
    const flashInterval = setInterval(() => {
        const randomCells = [];
        while (randomCells.length < maxFlashes) {
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

function updateCalledNumbers() {
    if (calledNumbers.size === 0) {
        // Clear all ball displays when there are no called numbers
        currentNumber = null;
        previousNumbers = [];
        updateCalledBall(null);
        ['lastBall', 'lastBall2', 'lastBall3', 'lastBall4'].forEach(id => {
            updateBallDisplay(document.getElementById(id), null);
        });
        return;
    }

    const calledNumbersArray = Array.from(calledNumbers).reverse();
    currentNumber = calledNumbersArray[0];
    previousNumbers = calledNumbersArray.slice(1, 5);

    // Update main ball
    updateCalledBall(currentNumber);

    // Update small balls
    ['lastBall1', 'lastBall2', 'lastBall3', 'lastBall4'].forEach((id, index) => {
        updateBallDisplay(document.getElementById(id), previousNumbers[index]);
    });
}

//document.getElementById('generateButton').addEventListener('click', generateRandomNumber);
document.getElementById('numberInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const number = parseInt(this.value);
        if (!isNaN(number)) callNumber(number);
        this.value = '';
    }
});

// Event listeners
document.getElementById('numberInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const number = parseInt(this.value);
        if (number >= 1 && number <= 75) {
            handleNewNumber(number);
            this.value = ''; // Clear input after use
        }
    }
});
createBoard();

const enableDataCheckbox = document.getElementById('enableDataCheckbox');
const playerList = document.getElementById('playerList');

enableDataCheckbox.addEventListener('change', () => {
    const isEnabled = enableDataCheckbox.checked;
    if (enableDataCheckbox.checked) {
        startFetchingPlayerData(); // Start periodic fetching
        playerList.style.display = 'block'; // Show the player list
        qrCode.style.display = 'block';
    } else {
        stopFetchingPlayerData(); // Stop periodic fetching
        playerList.style.display = 'none'; // Hide the player list
        qrCode.style.display = 'none';
        clearPlayerCards(); // Optional: clear existing data
    }

    // Update server with new login status
    fetch('/updateLoginStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            enabled: isEnabled
        })
    });

    if (isEnabled) {
        startFetchingPlayerData();
        playerList.style.display = 'block';
        qrCode.style.display = 'block';
    } else {
        stopFetchingPlayerData();
        playerList.style.display = 'none';
        qrCode.style.display = 'none';
        clearPlayerCards();
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
                cell.classList.add('free-space', 'marked'); // Add both classes
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
    showConfirm(
        "Confirm Remove All Players",
        "Are you sure you want to remove all players from the game?",
        () => {
            const playerCards = document.querySelectorAll('.player-card');
            playerCards.forEach(card => {
                const playerName = card.getAttribute('data-player');
                removePlayerCard(playerName);
            });
        }
    );
}

function resetAllPlayerCards() {

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
    fetch(`/deactivatePlayer/${playerName}`, {
            method: 'POST'
        })
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
                    // Check for winner after adding the number
                    const winInfo = checkWinningPatterns(player.card, player.markedNumbers);
                    if (winInfo) {
                        handleWinner(winInfo);
                    }
                } else {
                    player.markedNumbers.splice(numberIndex, 1);
                }
            }
        }
    }
}

setInterval(fetchPlayerCards, 5000);

socket.on('numberMarked', ({
    playerName,
    number
}) => {
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

// Initialize Notiflix with custom settings
Notiflix.Report.init({
    width: '360px',
    backgroundColor: '#f8f8f8',
    borderRadius: '12px',
    backOverlay: true,
    backOverlayClickToClose: false,
    fontFamily: 'inherit',
    svgSize: '80px',
    plainText: true,
    titleFontSize: '18px',
    titleMaxLength: 34,
    messageFontSize: '15px',
    buttonFontSize: '14px',
    cssAnimation: true,
    cssAnimationDuration: 300,
    cssAnimationStyle: 'fade', // 'fade' | 'zoom'

    // Button styling
    buttonBackground: '#2196f3',
    buttonBorderRadius: '8px',
    buttonFontSize: '14px',
    buttonMaxLength: 34,
});


// Error message function
function showError(message, title = 'Error') {
    Notiflix.Report.failure(
        title,
        message,
        'OK'
    );
}

// Success message function
function showSuccess(message, title = 'Success') {
    Notiflix.Report.success(
        title,
        message,
        'OK'
    );
}

// Warning message function
function showWarning(message, title = 'Warning') {
    Notiflix.Report.warning(
        title,
        message,
        'OK'
    );
}

// Info message function
function showInfo(message, title = 'Info') {
    Notiflix.Report.info(
        title,
        message,
        'OK'
    );
}

// If you need confirmation dialogs
function showConfirm(title, message, onConfirm) {
    Notiflix.Confirm.show(
        title,
        message,
        'Yes',
        'No',
        onConfirm,
        () => {} // onCancel callback
    );
}
// Store the current and previous numbers
let currentNumber = null;
let previousNumbers = [];

function getBingoLetter(number) {
    if (number <= 15) return 'B';
    if (number <= 30) return 'I';
    if (number <= 45) return 'N';
    if (number <= 60) return 'G';
    return 'O';
}

function updateBallDisplay(element, number) {
    if (!element) return;

    // Clear if no number
    if (!number) {
        element.textContent = '';
        element.setAttribute('data-letter', '');
        element.classList.remove('ball-B', 'ball-I', 'ball-N', 'ball-G', 'ball-O',
            'small-ball-B', 'small-ball-I', 'small-ball-N', 'small-ball-G', 'small-ball-O');
        return;
    }

    // Set number and letter
    const letter = getBingoLetter(number);
    element.textContent = number;
    element.setAttribute('data-letter', letter);

    // Apply correct color class
    element.classList.remove('ball-B', 'ball-I', 'ball-N', 'ball-G', 'ball-O',
        'small-ball-B', 'small-ball-I', 'small-ball-N', 'small-ball-G', 'small-ball-O');

    if (element.id === 'calledBall') {
        element.classList.add(`ball-${letter}`);
    } else {
        element.classList.add(`small-ball-${letter}`);
    }
}

function updateCalledBall(number) {
    const calledBall = document.getElementById('calledBall');
    updateBallDisplay(calledBall, number);
}

function updateSmallBalls() {
    // Update each small ball with the previous numbers
    for (let i = 0; i < 4; i++) {
        const ballElement = document.getElementById(`lastBall${4-i}`);
        updateBallDisplay(ballElement, previousNumbers[i]);
    }
}

function handleNewNumber(number) {
    if (!number) return;

    // Validate number
    number = parseInt(number);
    if (number < 1 || number > 75) return;

    // If there's a current number, add it to previous numbers
    if (currentNumber !== null) {
        previousNumbers.unshift(currentNumber);
        if (previousNumbers.length > 4) {
            previousNumbers.pop();
        }
    }

    // Set the new current number
    currentNumber = number;

    // Update displays
    updateCalledBall(currentNumber);
    updateSmallBalls();
}

// Add this to your existing generateButton click handler
document.getElementById('generateButton').addEventListener('click', function() {
    // Replace this with your actual random number generation logic
    const number = Math.floor(Math.random() * 75) + 1;

    //	if (isGenerating) return;
    if (number.size >= 75) {
        showError("All numbers have been called.");
        return;
    }
    isGenerating = true;
    flashBoard();
    setTimeout(() => {
        let number;
        do {
            number = Math.floor(Math.random() * 75) + 1;
            //const number = Math.floor(Math.random() * 75) + 1;
        } while (calledNumbers.has(number));
        handleNewNumber(number);
        callNumber(number);
        isGenerating = false;
    }, 3000);

});