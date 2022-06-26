let _gameState = null;

const STATES = {
	IDLE: 0,
	PLAYING: 1,
	ENDED: 2,
}

const FIGURES = ["cross", "circle", "square", "plus", "star"];

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

function saveGameState(state) {
	_gameState = state;
	saveData('gameState', state);
}

function loadGameState() {
	_gameState = loadData('gameState');
}

function getGameState() {
	return _gameState;
}

function createGame(config, firstPlayer) {
	if (config.nPlayers > 5) {
		throw new Error('Too many players');
	}
	let gameState = {
		config: {
			...config
		},
		board: [],
		players: [
			{ ...firstPlayer }
		],
		state: STATES.PLAYING,
		winner: null,
		turn: 0,
		turns: [],
	};

	gameState.players.push({...firstPlayer})

	for (let i = 0; i < gameState.config.size; i++) {
		gameState.board.push((new Array(gameState.config.size)).fill(null));
	}

	const tmpTurns = [];
	for (let i = 0; i < gameState.config.nPlayers; i++) {
		tmpTurns.push(i);
	}

	while (tmpTurns.length > 0) {
		const i = getRandomInt(0, tmpTurns.length);
		gameState.turns.push(...tmpTurns.splice(i, 1));
	}

	saveGameState(gameState);
	return gameState;
}

// Comprobar si le toca jugar al jugador
// Comprobar si se puede òner una ficha
// Si al poner la ficha, ese jugador ha ganado
// Si al poner la ficha, el tablero está completo
// Actualizar el tablero
// Actualizar el turno
// Actualizar el estado y el ganador, si toca
function placePiece(playerIndex, row, column) {
	const gameState = JSON.parse(JSON.stringify(getGameState()));

	if (gameState.state !== STATES.PLAYING) {
		throw new Error('Game is not in PLAYING state');
	}

	const { board } = gameState;

	const currentPlayerIndex = gameState.turns[gameState.turn];
	
	if (currentPlayerIndex !== playerIndex) {
		throw new Error('It is not your turn');
	}

	if (board[row][column] !== null) {
		throw new Error('This cell is already occupied');
	}

	board[row][column] = playerIndex;
	if (playerWon(playerIndex, board, gameState.config.goal)) {
		gameState.winner = playerIndex;
		gameState.state = STATES.ENDED;
		saveGameState(gameState);
		return gameState;
	}

	if (boardIsFull(board)) {
		gameState.state = STATES.ENDED;
		saveGameState(gameState);
		return gameState;
	}

	gameState.turn++;
	if (gameState.turn >= gameState.turns.length) {
		gameState.turn = 0;
	}
	saveGameState(gameState);
	return gameState;
}

function playerWon(playerIndex, board, goal) {
	const boardState = JSON.parse(JSON.stringify(board)).map(row => row.map(cell => ({
		player: cell === playerIndex ? playerIndex : null,
		checked: {
			bottom: null,
			right: null,
			diag: null,
		}
	})));

	const DIRECTIONS = {
		bottom: [1, 0],
		right: [0, 1],
		diag: [1, 1],
	};

	function getDirectionPieces(directionName, boardState, row, column, currentCount) {
		const direction = DIRECTIONS[directionName];
		const nextRow = row + direction[0];
		const nextColumn = column + direction[1];
		
		if (nextRow >= boardState.length) {
			return currentCount;
		}

		if (nextColumn >= boardState[nextRow].length) {
			return currentCount;
		}

		const nextCell = boardState[nextRow][nextColumn];
		if (!nextCell.player) {
			return currentCount;
		}

		nextCell.checked[directionName] = true;

		return getDirectionPieces(directionName, boardState, nextRow, nextColumn, currentCount + 1);
	}

	for (const row in boardState) {
		for (const column in boardState[row]) {
			const cellState = boardState[row][column];
			if (!cellState.player) {
				continue;
			}

			for (const directionName in DIRECTIONS) {
				const direction = DIRECTIONS[directionName];
				if (cellState.checked[directionName]) {
					continue;
				}
				const pieces = getDirectionPieces(directionName, boardState, row, column, 1);
				if (pieces >= goal) {
					return true;
				}
			}
		}
	}

	return false;
}


function boardIsFull(board) {
	for (const row in board) {
		for (const column in board[row]) {
			if (board[row][column] === null) {
				return false;
			}
		}
	}
	return true;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getFigures() {
	return FIGURES;
}

loadGameState();

export { getFigures, createGame, getGameState, placePiece };