const puzzles = [
    {
        date: '2024-01-20',
        startWord: 'WATER',
        endWord: 'STEAM',
        choices: ['HEAT', 'BOIL', 'LIQUID', 'VAPOR', 'GAS'],
        solution: ['LIQUID', 'HEAT', 'BOIL', 'VAPOR', 'GAS']
    }
];

const defaultPuzzle = {
    date: '2024-01-20',
    startWord: 'KNEE',
    endWord: 'RAP',
    choices: ['TWO', 'BODY', 'DOLLAR', 'JEW', 'RHYME'],
    solution: ['BODY', 'TWO', 'JEW', 'RHYME', 'DOLLAR']
};

function getPuzzleForDate(date) {
    return puzzles.find(puzzle => puzzle.date === date) || defaultPuzzle;
}
