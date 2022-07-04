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
	const res = await fetch(`/api/game/${gameId}/start`, {
		method: 'POST',
	});
	return await res.json();
}

function placePiece(row, column) {
	const res = await fetch(`/api/game/${gameId}/place-piece`, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			row,
			column,
		})
	});
	return await res.json();
}

function getFigures() {
	return FIGURES;
}

export { getFigures, getAllGames, getGameState, createGame, startGame, placePiece };