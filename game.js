const Store = require('./store');
const express = require('express');

const STATES = {
	IDLE: 0,
	PLAYING: 1,
	ENDED: 2,
}

function getRandomId() {
	return Math.random().toString(36).substring(2);
}

const router = express.Router();

router.post('/', (req, res) => {
	const {config, firstPlayer} = req.body;

	if (config.nPlayers > 5) {
		throw new Error('Too many players');
	}
	let game = {
		id: getRandomId(),
		config,
		board: [],
		players: [
			firstPlayer
		],
		state: STATES.PLAYING,
		winner: null,
		turn: 0,
		turns: [],
	};

	for (let i = 0; i < game.config.size; i++) {
		game.board.push((new Array(game.config.size)).fill(null));
	}

	const store = Store.getStore();
	store.games[game.id] = game;
	Store.saveStore(store);

	if(!req.session.gamesPlaying) {
		req.session.gamesPlaying = {};
	}
	req.session.gamesPlaying[game.id] = {
		playerIndex: 0,
	};
	console.log(req.session);
	res.send({game});
});

router.get('/all', (req, res) => {
	const gamesIds = Object.keys(req.session.gamesPlaying) ?? [];

	const store = Store.getStore();

	const games = gamesIds.map(id => ({
		game: store.games[id],
		playerIndex: req.session.gamesPlaying[id].playerIndex,
	}));
	
	res.send({
		games: games,
	});
});

router.get('/:gameId', (req, res) => {
	if (!req.session.gamesPlaying?.[req.params.gameId]) {
		throw new Error('You are not playing this game');
	}

	const store = Store.getStore();

	if (!store.games[req.params.gameId]) {
		delete req.session.gamesPlaying[req.params.gameId];
		throw new Error('This game does not exist');
	}
	
	res.send({
		game: store.games[req.params.gameId],
		playerIndex: req.session.gamesPlaying[req.params.gameId].playerIndex,
	});
});

router.post('/:gameId/join', (req, res) => {
	if (req.session.gamesPlaying?.[req.params.gameId]) {
		throw new Error('You are already playing this game');
	}

	const store = Store.getStore();

	const game = store.games[req.params.gameId];

	if (!game) {
		throw new Error('This game does not exist');
	}

	if (game.state !== STATES.IDLE) {
		throw new Error('This game is already started');
	}

	if (game.players.length >= game.config.nPlayers) {
		throw new Error('This game is full');
	}

	const { playerName } = req.body;

	if (game.players.find(player => player.name.toLowerCase() === playerName.toLowerCase())) {
		throw new Error('This player is already in this game');
	}

	const player = {
		name: playerName,
	};

	game.players.push(player);

	req.session.gamesPlaying[req.params.gameId] = {
		playerIndex: game.players.length - 1,
	};

	Store.saveStore(store);
	
	res.send({
		game: store.game,
		playerIndex: game.players.length - 1,
	});
});

router.post('/:gameId/start', (req, res) => {
	if (!req.session.gamesPlaying?.[req.params.gameId]) {
		throw new Error('You are not playing this game');
	}

	if (req.session.gamesPlaying?.[req.params.gameId].playerIndex !== 0) {
		throw new Error('You are can not start this game');
	}

	const store = Store.getStore();

	const game = store.games[req.params.gameId];

	if (!game) {
		throw new Error('This game does not exist');
	}

	if (game.state !== STATES.IDLE) {
		throw new Error('This game is already started');
	}

	const tmpTurns = [];
	for (let i = 0; i < game.players.length; i++) {
		tmpTurns.push(i);
	}

	while (tmpTurns.length > 0) {
		const i = getRandomInt(0, tmpTurns.length);
		game.turns.push(...tmpTurns.splice(i, 1));
	}

	game.state = STATES.PLAYING;
	game.turn = 0;

	Store.saveStore(store);
	
	res.send({
		game: store.game,
		playerIndex: game.players.length - 1,
	});
});

router.post('/:gameId/place-piece', (req, res) => {
	if (!req.session.gamesPlaying?.[req.params.gameId]) {
		throw new Error('You are not playing this game');
	}

	const store = Store.getStore();

	const game = store.games[req.params.gameId];

	if (!game) {
		throw new Error('This game does not exist');
	}

	if (game.state !== STATES.PLAYING) {
		throw new Error('Game is not in PLAYING state');
	}

	const playerIndex = req.session.gamesPlaying?.[req.params.gameId].playerIndex;

	if (game.turns[game.turn] !== playerIndex) {
		throw new Error('It is not your turn');
	}

	const { board } = game;

	const currentPlayerIndex = game.turns[game.turn];
	
	if (currentPlayerIndex !== playerIndex) {
		throw new Error('It is not your turn');
	}

	const {row, column} = req.body;

	if (board[row][column] !== null) {
		throw new Error('This cell is already occupied');
	}

	board[row][column] = playerIndex;
	if (playerWon(playerIndex, board, game.config.goal)) {
		game.winner = playerIndex;
		game.state = STATES.ENDED;
		saveGameState(game);
		return game;
	}

	if (boardIsFull(board)) {
		game.state = STATES.ENDED;
		saveGameState(game);
		return game;
	}

	game.turn++;
	if (game.turn >= game.turns.length) {
		game.turn = 0;
	}

	Store.saveStore(store);
	
	res.send({
		game: store.game,
		playerIndex: game.players.length - 1,
	});
});

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

module.exports = {
	router,
}
