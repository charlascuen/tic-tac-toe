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

	res.send({game});
});

module.exports = {
	router,
}
