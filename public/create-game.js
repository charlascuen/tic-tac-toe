import * as Server from './server.js';

document.addEventListener('DOMContentLoaded', () => {
	const createGameButton = document.getElementById('create-game');
	createGameButton.addEventListener('click', () => {
		const firstPlayerInput = document.getElementById('first-player');
		const sizeInput = document.getElementById('size');
		const goalInput = document.getElementById('goal');
		const backgroundInput = document.getElementById('background');
		const nPlayersInput = document.getElementById('n-players');
		const gravityInput = document.getElementById('gravity');
		const config = {
			size: parseInt(sizeInput.value),
			goal: parseInt(goalInput.value),
			background: backgroundInput.value,
			nPlayers: parseInt(nPlayersInput.value),
			gravity: gravityInput.checked,
		};
		const firstPlayer = {
			name: firstPlayerInput.value,
		}
		const gameState = Server.createGame(config, firstPlayer);
	})
});