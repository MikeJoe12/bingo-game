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
        currentPlayerName = document.getElementById('playerName').value;
        playerName = document.getElementById('playerName').value;

        if (!playerName) {
            alert('Please enter your name');
            return;
        }
		
        // Play chime if enabled
        chimeSound.play();

        // Show chime toggle
        const chimeToggleContainer = document.getElementById('chimeToggleContainer');
        chimeToggleContainer.classList.add('visible');

        // Remove login section and display player name
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('playerNameDisplay').textContent = `${playerName}'s Bingo Card`;

        const card = [];
        const usedNumbers = new Set();
        const headers = ['B', 'I', 'N', 'G', 'O'];

        for (let i = 0; i < 5; i++) {
            const row = [];
            for (let j = 0; j < 5; j++) {
                let num;
                do {
                    num = Math.floor(Math.random() * 15) + 1 + (j * 15);
                } while (usedNumbers.has(num));
                usedNumbers.add(num);
                row.push(num);
            }
            card.push(row);
        }

        card[2][2] = 'FREE'; // Free space

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

        // Send player name and card to the server
        fetch('/saveCard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName, card }),
        });
    }

    function markNumber(number, playerName) {
        socket.emit('markNumber', { playerName, number });
    }

    // Prevent page reload
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', function() {
        history.pushState(null, null, location.href);
    });

    window.addEventListener('beforeunload', function(e) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    });

    window.onbeforeunload = function(e) {
        e.preventDefault();
        return false;
    };
       
    // Disable context menu and selection
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
    });

    window.addEventListener('unload', function(e) {
        e.preventDefault();
    });