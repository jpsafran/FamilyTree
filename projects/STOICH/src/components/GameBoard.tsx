import React from 'react';
import './GameBoard.css';

interface GameBoardProps {
  startWord: string;
  endWord: string;
  selectedWords: string[];
}

const GameBoard: React.FC<GameBoardProps> = ({ startWord, endWord, selectedWords }) => {
  return (
    <div className="game-board">
      <div className="word-grid">
        <div className="horizontal-line"></div>
        <div className="vertical-line vertical-line-1"></div>
        <div className="vertical-line vertical-line-2"></div>
        
        <div className="word-cell start-word">
          {startWord}
        </div>
        
        {selectedWords.map((word, index) => (
          <div 
            key={index} 
            className="word-cell"
            data-index={index}
            style={{
              gridRow: index === 0 ? 2 : index === 1 ? 1 : index === 2 ? 2 : index === 3 ? 1 : 2,
              gridColumn: index === 0 ? 1 : index === 1 ? 2 : index === 2 ? 2 : index === 3 ? 3 : 3
            }}
          >
            {word || '?'}
          </div>
        ))}
      </div>
      <div className="word-cell end-word final-position">{endWord}</div>
    </div>
  );
};

export default GameBoard;
