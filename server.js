const express = require('express');
const session = require('express-session');

const game = require('./game');
const app = express();
const port = 8080;

app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}));

app.use(express.json());

app.use((req, res, next) => {
	console.log(req.method, req.url, new Date());
	next();
});

app.use('/api/game', game.router);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send({
		error: err.message,
	});
});

app.use(express.static('public'));

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
