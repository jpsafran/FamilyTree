document.addEventListener('DOMContentLoaded', () => {
    let selectedWords = Array(5).fill('');
    let guessCount = 0;
    let gameStatus = 'playing';
    const today = new Date().toISOString().split('T')[0];
    const dailyPuzzle = getPuzzleForDate(today);

    // Initialize game board
    function initializeGameBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = `
            <div class="word-grid">
                <div class="horizontal-line"></div>
                <div class="vertical-line vertical-line-1"></div>
                <div class="vertical-line vertical-line-2"></div>
                <div class="word-cell start-word" style="grid-column: 1; grid-row: 1;">${dailyPuzzle.startWord}</div>
                <div class="word-cell highlight-next" data-index="0" style="grid-column: 1; grid-row: 2">?</div>
                <div class="word-cell" data-index="1" style="grid-column: 2; grid-row: 1">?</div>
                <div class="word-cell" data-index="2" style="grid-column: 2; grid-row: 2">?</div>
                <div class="word-cell" data-index="3" style="grid-column: 3; grid-row: 1">?</div>
                <div class="word-cell" data-index="4" style="grid-column: 3; grid-row: 2">?</div>
            </div>
            <div class="word-cell end-word final-position">${dailyPuzzle.endWord}</div>
        `;
    }

    // Update word selection handling
    function updateWordSelection(button, word) {
        const existingIndex = selectedWords.indexOf(word);
        if (existingIndex !== -1) {
            // Remove word and reset cell to white
            selectedWords[existingIndex] = '';
            button.classList.remove('selected');
            const cell = document.querySelector(`[data-index="${existingIndex}"]`);
            cell.style.background = 'white';  // Reset to white when removing word
            cell.classList.remove('word-filled');
        } else {
            // Fill from left to right, starting at index 0
            const nextEmptyIndex = selectedWords.findIndex(w => !w);
            if (nextEmptyIndex !== -1 && nextEmptyIndex < 5) {
                selectedWords[nextEmptyIndex] = word;
                button.classList.add('selected');
                const cell = document.querySelector(`[data-index="${nextEmptyIndex}"]`);
                cell.style.background = '#fff5b8';  // Yellow background for guesses
            }
        }
        updateGameBoard();
    }

    // Initialize word selector
    function initializeWordSelector() {
        const wordSelector = document.getElementById('wordSelector');
        wordSelector.innerHTML = `
            <div class="word-options">
                ${dailyPuzzle.choices.map(word => `
                    <button class="word-option" data-word="${word}">${word}</button>
                `).join('')}
            </div>
        `;

        const wordButtons = document.querySelectorAll('.word-option');
        wordButtons.forEach(button => {
            button.addEventListener('click', () => {
                const word = button.dataset.word;
                updateWordSelection(button, word);
            });
        });
    }

    // Update game board display
    function updateGameBoard() {
        const cells = document.querySelectorAll('.word-cell:not(.start-word):not(.end-word)');
        cells.forEach((cell, index) => {
            cell.textContent = selectedWords[index] || '?';
            cell.classList.remove('highlight-next');
            
            // Reset background if no word
            if (!selectedWords[index]) {
                cell.style.removeProperty('background');
            }
            
            // Handle highlighting of next empty cell
            if ((!selectedWords[index] && index === selectedWords.findIndex(word => !word)) || 
                (selectedWords.every(word => !word) && index === 0)) {
                cell.classList.add('highlight-next');
            }
            
            // Add click handler to cells
            cell.onclick = () => {
                if (selectedWords[index]) {
                    const button = document.querySelector(`.word-option[data-word="${selectedWords[index]}"]`);
                    if (button) button.classList.remove('selected');
                    selectedWords[index] = '';
                    cell.style.removeProperty('background');
                    updateGameBoard();
                }
            };
        });
    }

    // Check guess
    function checkGuess() {
        guessCount++;
        const solution = dailyPuzzle.solution;
        const filledWords = selectedWords.filter(word => word !== '');
        
        if (filledWords.length < 5) {
            showAlert("Please fill all positions before checking");
            guessCount--; // Don't count incomplete attempts
            return;
        }

        let incorrectPositions = 0;
        selectedWords.forEach((word, index) => {
            if (word !== solution[index]) {
                incorrectPositions++;
            }
        });

        if (incorrectPositions === 0) {
            gameStatus = 'won';
            selectedWords.forEach((_, index) => {
                setTimeout(() => {
                    const element = document.querySelector(`[data-index="${index}"]`);
                    if (element) element.classList.add('correct');
                }, index * 200);
            });
            showGameOver(true);
        } else {
            showAlert(`${incorrectPositions} ${incorrectPositions === 1 ? 'word is' : 'words are'} in wrong positions. Tries left: ${5 - guessCount}`);
            if (guessCount >= 5) {
                gameStatus = 'lost';
                showGameOver(false);
            }
        }
    }

    // Event Listeners
    document.getElementById('checkButton').addEventListener('click', checkGuess);
    document.getElementById('infoButton').addEventListener('click', () => {
        document.getElementById('infoModal').style.display = 'flex';
    });
    document.getElementById('closeInfoButton').addEventListener('click', () => {
        document.getElementById('infoModal').style.display = 'none';
    });
    document.getElementById('alertCloseButton').addEventListener('click', () => {
        document.getElementById('alertOverlay').style.display = 'none';
    });
    document.getElementById('playAgainButton').addEventListener('click', resetGame);

    // Helper functions
    function showAlert(message) {
        document.getElementById('alertMessage').textContent = message;
        document.getElementById('alertOverlay').style.display = 'flex';
    }

    function showGameOver(won) {
        const gameOver = document.getElementById('gameOver');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        
        if (won) {
            title.textContent = 'Congratulations! 🎉';
            message.textContent = `You solved it in ${guessCount} tries!`;

            selectedWords.forEach((_, index) => {
                setTimeout(() => {
                    const element = document.querySelector(`[data-index="${index}"]`);
                    if (element) {
                        element.style.removeProperty('background');
                        element.classList.add('correct');
                    }
                }, index * 200);
            });
        } else {
            title.textContent = 'Better luck next time!';
            message.textContent = 'Here is the correct sequence:';

            dailyPuzzle.solution.forEach((word, index) => {
                setTimeout(() => {
                    const element = document.querySelector(`[data-index="${index}"]`);
                    if (element) {
                        element.style.removeProperty('background');
                        element.classList.add('flip');
                        setTimeout(() => {
                            element.style.transform = 'perspective(400px) rotateY(0deg)';
                            element.textContent = word;
                            element.classList.add('wrong');
                        }, 150);
                    }
                }, index * 300);
            });
        }
        
        gameOver.style.display = 'block';
        document.getElementById('checkButton').style.display = 'none';
        document.getElementById('wordSelector').style.display = 'none';
    }

    function resetGame() {
        selectedWords = Array(5).fill('');
        guessCount = 0;
        gameStatus = 'playing';
        document.querySelectorAll('.word-option').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.word-cell:not(.start-word):not(.end-word)').forEach(cell => {
            cell.classList.remove('correct', 'wrong', 'flip');
            cell.style.removeProperty('background');
            cell.style.removeProperty('transform');
        });
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('checkButton').style.display = 'block';
        document.getElementById('wordSelector').style.display = 'block';
        updateGameBoard();
    }

    // Initialize the game
    initializeGameBoard();
    initializeWordSelector();
});
