export interface Puzzle {
  date: string;
  startWord: string;
  endWord: string;
  choices: string[];
  solution: string[];
}

export const puzzles: Puzzle[] = [
  {
    date: '2024-01-20',
    startWord: 'WATER',
    endWord: 'STEAM',
    choices: ['HEAT', 'BOIL', 'LIQUID', 'VAPOR', 'GAS'],
    solution: ['LIQUID', 'HEAT', 'BOIL', 'VAPOR', 'GAS']
  },
  // Add more puzzles here
];

export const defaultPuzzle: Puzzle = {
  date: '2024-01-20',
  startWord: 'KNEE',
  endWord: 'RAP',
  choices: ['TWO', 'BODY', 'DOLLAR', 'JEW', 'RHYME'],
  solution: ['BODY', 'TWO', 'JEW', 'RHYME', 'DOLLAR']
};

export const getPuzzleForDate = (date: string): Puzzle => {
  return puzzles.find(puzzle => puzzle.date === date) || defaultPuzzle;
};
