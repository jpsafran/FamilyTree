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
    startWord: 'IRON',
    endWord: 'FRONTMAN',
    choices: ['METAL', 'HEAVY', 'LEAD', 'GOLD', 'MUSIC'],
    solution: ['GOLD', 'METAL', 'HEAVY', 'MUSIC', 'LEAD']
};

function getPuzzleForDate(date) {
    return puzzles.find(puzzle => puzzle.date === date) || defaultPuzzle;
}
