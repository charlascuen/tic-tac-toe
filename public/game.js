import * as Server from './server.js';

function getPlayerFigure(playerIndex) {
	const figures = Server.getFigures();
	const figure = figures[playerIndex];
	const image = document.createElement('img');
	image.setAttribute('src', `/images/${figure}.svg`);
	return image;
}

function createBoard(board) {
	const table = document.createElement('table');
	for (let row in board) {
		const tr = document.createElement('tr');
		for (let column in board[row]) {
			const cell = board[row][column];
			const td = document.createElement('td');
			
			if (cell != null) {
				td.appendChild(getPlayerFigure(cell));
			}

			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	document.body.appendChild(table);
}

document.addEventListener('DOMContentLoaded', () => {
	const gameState = Server.getGameState();
	const {board} = gameState;
	createBoard(board);
});