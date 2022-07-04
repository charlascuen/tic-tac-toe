const express = require('express');
const session = require('express-session');

const game = require('./game');
const app = express();
const port = 8080;

app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}))

app.use(express.json());

app.use('/api/game', game.router);

app.use(express.static('public'));

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
