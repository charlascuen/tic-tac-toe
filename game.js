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

	const tmpTurns = [];
	for (let i = 0; i < game.config.nPlayers; i++) {
		tmpTurns.push(i);
	}

	while (tmpTurns.length > 0) {
		const i = getRandomInt(0, tmpTurns.length);
		game.turns.push(...tmpTurns.splice(i, 1));
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

	store.game.players.push(player);

	req.session.gamesPlaying[req.params.gameId] = {
		playerIndex: game.players.length - 1,
	};

	Store.saveStore(store);
	
	res.send({
		game: store.game,
		playerIndex: game.players.length - 1,
	});
});

module.exports = {
	router,
}
