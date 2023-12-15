const express = require('express');
const bodyParser = require('body-parser');
const consign = require('consign');
const session = require('express-session');



var app = express();

app.set('view engine', 'ejs');
app.set('views', './app/views');

/*app.use(session({
	secret:'groscon@2023',
	resave:true,
	saveUninitialized:true
}));
*/
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

consign()
	.include('app/routes')
	.then('config/dbConnection.js')
	.then('app/models')
	.then('app/controllers')
	.into(app);

module.exports = app;