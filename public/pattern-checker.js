// Function to check if a player has won based on the current layouts
function checkWinningPatterns(playerCard, markedNumbers) {
    // Get the current layout patterns
    const layout1Cells = Array.from(document.querySelectorAll('#layout1 .highlighted'))
        .map(cell => Array.from(cell.parentElement.children).indexOf(cell));
    const layout2Cells = Array.from(document.querySelectorAll('#layout2 .highlighted'))
        .map(cell => Array.from(cell.parentElement.children).indexOf(cell));
    const layout3Cells = Array.from(document.querySelectorAll('#layout3 .highlighted'))
        .map(cell => Array.from(cell.parentElement.children).indexOf(cell));

    // Convert player's card to 1D array for easier checking
    const cardNumbers = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            cardNumbers.push(playerCard[row][col]);
        }
    }

    // Check each layout pattern
    const patterns = [
        { cells: layout1Cells, name: document.querySelector('#layoutTitle1').textContent },
        { cells: layout2Cells, name: document.querySelector('#layoutTitle2').textContent },
        { cells: layout3Cells, name: document.querySelector('#layoutTitle3').textContent }
    ];

    for (const pattern of patterns) {
        const containerNumber = patterns.indexOf(pattern) + 1;
        const layoutContainer = document.getElementById(`layoutContainer${containerNumber}`);
        
        // Skip if this pattern has already been won
        if (layoutContainer.classList.contains('disabled')) {
            continue;
        }

        // Check if all required numbers for this pattern are marked
        const patternComplete = pattern.cells.every(cellIndex => {
            // Handle FREE space in center
            if (cellIndex === 12) return true;
            return markedNumbers.includes(cardNumbers[cellIndex]);
        });

        if (patternComplete) {
            return {
                pattern: pattern.name,
                playerName: playerCard.playerName,
                layoutContainer: layoutContainer
            };
        }
    }

    return null;
}

// Function to announce winner and update UI
function handleWinner(winInfo) {
    // Create alert message
    const message = `Congratulations! ${winInfo.playerName} has won ${winInfo.pattern}!`;
    alert(message);
    
    // Disable the winning pattern layout
    winInfo.layoutContainer.classList.add('disabled');
    
    // Create winner display
    createWinnerDisplay(winInfo.layoutContainer, winInfo.playerName);
    
    // Save game state
    saveGameState();
    
    // Optionally speak the winner announcement if speech is enabled
    if (document.getElementById('speakCheckbox').checked) {
        speakNumber(message);
    }
}

// Modified callNumber function to include winner checking
function updateCallNumber(originalCallNumber) {
    const originalFunction = originalCallNumber;
    
    return function(number) {
        // Call the original function first
        originalFunction.call(this, number);
        
        // Then check for winners
        if (window.playerCards) {
            window.playerCards.forEach(playerData => {
                const winInfo = checkWinningPatterns(playerData.card, playerData.markedNumbers);
                if (winInfo) {
                    handleWinner(winInfo);
                }
            });
        }
    };
}

// Replace the original callNumber function with our enhanced version
callNumber = updateCallNumber(callNumber);