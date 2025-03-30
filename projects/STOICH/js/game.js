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
                <div class="word-cell" data-index="0" style="grid-column: 1; grid-row: 2">?</div>
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
            // Remove word
            selectedWords[existingIndex] = '';
            button.classList.remove('selected');
        } else {
            // Fill from left to right, starting at index 0
            const nextEmptyIndex = selectedWords.findIndex(w => !w);
            if (nextEmptyIndex !== -1 && nextEmptyIndex < 5) {  // Make sure we don't exceed array bounds
                selectedWords[nextEmptyIndex] = word;
                button.classList.add('selected');
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
        });
    }

    // Check guess
    function checkGuess() {
        guessCount++;
        let incorrectPositions = 0;
        selectedWords.forEach((word, index) => {
            if (word !== dailyPuzzle.solution[index]) {
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
            showAlert(`${incorrectPositions} words are in wrong positions. Tries left: ${5 - guessCount}`);
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
                    if (element) element.classList.add('correct');
                }, index * 200);
            });
        } else {
            title.textContent = 'Better luck next time!';
            message.textContent = 'Here is the correct sequence:';

            // Reveal correct answers with flip animation
            dailyPuzzle.solution.forEach((word, index) => {
                setTimeout(() => {
                    const element = document.querySelector(`[data-index="${index}"]`);
                    if (element) {
                        element.classList.add('flip');
                        // Wait for flip animation midpoint to change text
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
        document.querySelectorAll('.word-cell').forEach(cell => cell.classList.remove('correct'));
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('checkButton').style.display = 'block';
        document.getElementById('wordSelector').style.display = 'block';
        updateGameBoard();
    }

    // Initialize the game
    initializeGameBoard();
    initializeWordSelector();
});
