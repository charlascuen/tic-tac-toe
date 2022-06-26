let state = null;

const FIGURES = ["x", "circle", "square", "triangle", "star"];

function saveData(key, data) {
	localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
	let data = localStorage.getItem(key);
	if (!data) {
		return null;
	}

	return JSON.parse(data);
}

function loadGameState() {
	state = loadData('gameState');
}

function getGameState() {
	return state;
}

function createGame(config, firstPlayer) {
	if (config.nPlayers > 5) {
		throw new Error('Too many players');
	}
	state = {
		config: {
			...config
		},
		board: [],
		players: [
			{ ...firstPlayer }
		],
		state: 0,
		winner: null,
		turn: 0,
		turns: [],
	};

	state.players.push({...firstPlayer})

	for (let i = 0; i < state.config.size; i++) {
		state.board.push((new Array(state.config.size)).fill(null));
	}

	const tmpTurns = [];
	for (let i = 0; i < state.config.nPlayers; i++) {
		tmpTurns.push(i);
	}

	while (tmpTurns.length > 0) {
		const i = getRandomInt(0, tmpTurns.length);
		state.turns.push(...tmpTurns.splice(i, 1));
	}

	saveData('gameState', state);
	return state;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getFigures() {
	return FIGURES;
}

loadGameState();

export { getFigures, createGame, getGameState };