import React from 'react';
import './WordSelector.css';

interface WordSelectorProps {
  words: string[];
  selectedWords: string[];
  onSelect: (word: string, index: number) => void;
}

const WordSelector: React.FC<WordSelectorProps> = ({ words, selectedWords, onSelect }) => {
  const handleWordClick = (word: string) => {
    const existingIndex = selectedWords.indexOf(word);
    if (existingIndex !== -1) {
      onSelect('', existingIndex); // Clear the word at its position
    } else {
      const nextEmptyIndex = selectedWords.findIndex(w => !w);
      if (nextEmptyIndex !== -1) {
        onSelect(word, nextEmptyIndex);
      }
    }
  };

  return (
    <div className="word-selector">
      <div className="word-options">
        {words.map((word) => (
          <button
            key={word}
            className={`word-option ${selectedWords.includes(word) ? 'selected' : ''}`}
            onClick={() => handleWordClick(word)}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WordSelector;
