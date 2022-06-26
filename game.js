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
	for (let rowIndex in board) {
		const row = board[rowIndex];
		const tr = document.createElement('tr');
		for (let cellIndex in row) {
			const cell = row[cellIndex];
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
	Server.placePiece(0, 0, 0);
});