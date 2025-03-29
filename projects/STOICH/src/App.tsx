import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import WordSelector from './components/WordSelector';
import { getPuzzleForDate, type Puzzle } from './data/dailyPuzzles';
import Alert from './components/Alert';
import './App.css';

const App: React.FC = () => {
  const [selectedWords, setSelectedWords] = useState<string[]>(Array(5).fill(''));
  const [guessCount, setGuessCount] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showInfo, setShowInfo] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<Puzzle>({
    date: new Date().toISOString().split('T')[0],
    startWord: 'WATER',
    endWord: 'STEAM',
    choices: ['HEAT', 'BOIL', 'LIQUID', 'VAPOR', 'GAS'],
    solution: ['LIQUID', 'HEAT', 'BOIL', 'VAPOR', 'GAS']
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const puzzle = getPuzzleForDate(today);
    if (puzzle) {
      setDailyPuzzle(puzzle);
    }
  }, []);

  const checkGuess = () => {
    setGuessCount(prev => prev + 1);
    let incorrectPositions = 0;
    selectedWords.forEach((word, index) => {
      if (word !== dailyPuzzle.solution[index]) {
        incorrectPositions++;
      }
    });
    
    if (incorrectPositions === 0) {
      setGameStatus('won');
      // Show success animation
      selectedWords.forEach((_, index) => {
        setTimeout(() => {
          const element = document.querySelector(`[data-index="${index}"]`);
          if (element) element.classList.add('correct');
        }, index * 200);
      });
    } else {
      setAlertMessage(`${incorrectPositions} words are in wrong positions. Tries left: ${5 - guessCount}`);
      setShowAlert(true);
      if (guessCount >= 5) {
        setGameStatus('lost');
      }
    }
    return incorrectPositions;
  };

  const resetGame = () => {
    setSelectedWords(Array(5).fill(''));
    setGuessCount(0);
    setGameStatus('playing');
  };

  return (
    <div className="app">
      <div className="header">
        <button className="info-button" onClick={() => setShowInfo(true)}>?</button>
        <h1>
          <div className="logo-grid">
            <span className="logo-text">STOICH</span>
          </div>
        </h1>
      </div>

      {showInfo && (
        <div className="info-modal">
          <div className="info-content">
            <h2>How to Play STOICH</h2>
            <ul>
              <li>Start with the leftmost word</li>
              <li>Fill in the grid from left to right</li>
              <li>Top words describe how bottom words are related</li>
              <li>Each column's relationship leads to the final word</li>
              <li>You have 5 attempts to find the correct sequence</li>
            </ul>
            <button onClick={() => setShowInfo(false)}>Got it!</button>
          </div>
        </div>
      )}

      {showAlert && (
        <Alert 
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      <GameBoard 
        startWord={dailyPuzzle.startWord}
        endWord={dailyPuzzle.endWord}
        selectedWords={selectedWords}
      />
      {gameStatus === 'playing' ? (
        <>
          <WordSelector
            words={dailyPuzzle.choices}
            onSelect={(word, index) => {
              const newWords = [...selectedWords];
              newWords[index] = word;
              setSelectedWords(newWords);
            }}
            selectedWords={selectedWords}
          />
          <button 
            className="check-button"
            onClick={checkGuess}
          >
            Check Answer
          </button>
        </>
      ) : (
        <div className="game-over">
          <h2>{gameStatus === 'won' ? 'Congratulations! 🎉' : 'Better luck next time!'}</h2>
          <p>You solved it in {guessCount} tries!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default App;
