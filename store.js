const fs = require('fs');

function saveStore(data) {
	fs.writeFileSync('./store.json', JSON.stringify(data));
}

function getStore() {
	if(!fs.existsSync('./store.json')) {
		return {
			games: {},
		};
	}
	return JSON.parse(fs.readFileSync('./store.json'));
}

module.exports = {
	saveStore,
	getStore,
};