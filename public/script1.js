// Hybrid approach supporting both methods
function playChime() {
    // Try HTML5 Audio first
    const htmlAudio = document.getElementById('chimeSound');
    if (htmlAudio) {
        htmlAudio.play().catch(error => {
            // If HTML5 audio fails, try Web Audio API
            if (audioContext && audioBuffer) {
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(0);
            }
        });
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

    function generateCard() {
        currentPlayerName = document.getElementById('playerName').value;
        playerName = document.getElementById('playerName').value;

        if (!playerName) {
            alert('Please enter your name');
            return;
        }

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
//==============================================================
 // Absolutely prevent page reload
        history.pushState(null, null, location.href);
        window.addEventListener('popstate', function() {
            history.pushState(null, null, location.href);
        });

        // Comprehensive reload prevention
        window.addEventListener('beforeunload', function(e) {
            e.preventDefault(); // Prevent default browser behavior
            e.returnValue = ''; // Required for Chrome
            return ''; // For other browsers
        });

        // Prevent page reload via multiple methods
        window.onbeforeunload = function(e) {
            e.preventDefault(); // Prevent default browser behavior
            return false; // Explicitly prevent reload
        };
       
        // Disable context menu and selection to prevent accidental actions
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
        });

        // Additional safeguard for browser history manipulation
        window.addEventListener('unload', function(e) {
            e.preventDefault();
        });
//==============================================================	