
    (function () {
        const SESSION_KEY = 'mishail-bingo-session';
        const HEARTBEAT_KEY = 'mishail-bingo-heartbeat';
        const HEARTBEAT_INTERVAL = 2000; // 2 seconds
        const HEARTBEAT_EXPIRY = 5000; // 5 seconds (allowable delay before considering session stale)

        let heartbeatInterval;

        // Function to check if a session is active
        function isSessionActive() {
            const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (!sessionData) return false;

            const { timestamp } = sessionData;
            const now = Date.now();

            // Check if the session is stale
            return now - timestamp <= HEARTBEAT_EXPIRY;
        }

        // Function to create a new session
        function createSession() {
            const sessionId = generateUniqueSessionId();
            const timestamp = Date.now();

            localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId, timestamp }));
            startHeartbeat();
        }

        // Start a heartbeat to indicate that the session is active
        function startHeartbeat() {
            heartbeatInterval = setInterval(() => {
                const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
                if (sessionData) {
                    sessionData.timestamp = Date.now();
                    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
                }
            }, HEARTBEAT_INTERVAL);
        }

        // Stop the heartbeat when the session ends
        function stopHeartbeat() {
            clearInterval(heartbeatInterval);
        }

        // Cleanup session on tab close or unload
        function setupSessionCleanup() {
            // Clear session on page unload
            window.addEventListener('unload', () => {
                stopHeartbeat();
                localStorage.removeItem(SESSION_KEY);
                localStorage.removeItem(HEARTBEAT_KEY);
            });

            // Warning for accidental refresh or close
            window.addEventListener('beforeunload', (event) => {
                event.preventDefault();
                event.returnValue = ''; // Display a generic warning message
                return ''; // For some older browsers
            });
        }

        // Generate a unique session ID
        function generateUniqueSessionId() {
            return `bingo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        // Display error if a session is already active
        function showSessionError() {
            const loginSection = document.getElementById('loginSection');
            if (loginSection) {
                loginSection.innerHTML = `
                    <div style="color: red; text-align: center;">
                        <p>A bingo card is already open.</p>
                        <p>Please close the existing card before opening a new one.</p>
                    </div>
                `;
            }
            document.body.style.pointerEvents = 'none'; // Disable further interactions
        }

        // Initialize session management
        document.addEventListener('DOMContentLoaded', () => {
            if (isSessionActive()) {
                // If a valid session exists, show an error
                showSessionError();
            } else {
                // No active session, create a new one
                createSession();
                setupSessionCleanup();
            }
        });

        // Handle cross-tab communication using the storage event
        window.addEventListener('storage', (event) => {
            if (event.key === SESSION_KEY && event.newValue) {
                // Another tab created a session; show error in this tab
                showSessionError();
            } else if (event.key === SESSION_KEY && !event.newValue) {
                // Session was cleared in another tab; reload this tab
                location.reload();
            }
        });
    })();

	const chimeSound = document.getElementById('chimeSound');
	
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
  chimeSound.play();
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