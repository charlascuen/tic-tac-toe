const STATES = {
	IDLE: 0,
	PLAYING: 1,
	ENDED: 2,
}

const FIGURES = ["cross", "circle", "square", "plus", "star"];

async function getAllGames() {
	const res = await fetch('/api/game/all', { method: 'GET' });
	return await res.json();
}

async function getGameState(gameId) {
	const res = await fetch(`/api/game/${gameId}`, { method: 'GET' });
	return await res.json();
}

function createGame(config, firstPlayer) {
	const res = await fetch('/api/game', {
		method: 'POST',
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			config,
			firstPlayer,
		})
	});
	return await res.json();
}

function startGame(gameId) {
	const res = await fetch(`/api/game/${gameId}`, {
		method: 'POST',
	});
	return await res.json();
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

function getFigures() {
	return FIGURES;
}

export { getFigures, getAllGames, getGameState, createGame, startGame, placePiece };