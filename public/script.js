const socket = io();
let bingoCard = [];
let matchedNumbers = [];

// Function to generate a random Bingo card
function generateBingoCard() {
  let card = new Set();
  while (card.size < 25) {
    const number = Math.floor(Math.random() * 75) + 1;
    card.add(number);
  }
  return Array.from(card);
}

// Function to render the Bingo card
function renderBingoCard(numbers) {
  const bingoCardDiv = document.getElementById('bingoCard');
  bingoCardDiv.innerHTML = '';
  numbers.forEach((number, index) => {
    const cell = document.createElement('div');
    cell.classList.add('bingo-cell');
    cell.textContent = number;
    cell.setAttribute('data-number', number);

    // Mark 'FREE' space
    if (index === 12) {
      cell.textContent = 'FREE';
      cell.classList.add('matched');
      matchedNumbers.push('FREE');
    }

    cell.addEventListener('click', () => {
      if (!cell.classList.contains('matched')) {
        cell.classList.add('matched');
        matchedNumbers.push(number);
        socket.emit('numberMatched', number);
        updateMatchedNumbers();
      }
    });

    bingoCardDiv.appendChild(cell);
  });
}

// Function to update matched numbers list
function updateMatchedNumbers() {
  const matchedList = document.getElementById('matchedNumbers');
  matchedList.innerHTML = matchedNumbers.join(', ');
}

// Join room on button click
document.getElementById('joinBtn').addEventListener('click', () => {
  const nickname = document.getElementById('nickname').value;
  if (nickname) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    // Initialize Bingo card and send nickname to server
    bingoCard = generateBingoCard();
    renderBingoCard(bingoCard);
    socket.emit('joinRoom', nickname);
  }
});

// Listen for new called numbers from the server
socket.on('numberCalled', (number) => {
  const calledNumbersList = document.getElementById('calledNumbers');
  const listItem = document.createElement('li');
  listItem.textContent = number;
  calledNumbersList.appendChild(listItem);

  // Auto-mark if the called number is in the Bingo card
  document.querySelectorAll(`.bingo-cell[data-number='${number}']`).forEach((cell) => {
    cell.classList.add('matched');
    matchedNumbers.push(number);
    updateMatchedNumbers();
  });
});

// Listen for updates to player progress
socket.on('updateProgress', (players) => {
  console.log('Updated player progress:', players);
});
