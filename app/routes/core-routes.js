import React from 'react';
import ReactDOM from 'react-dom/server';
import JsonData from '../json/data.json';
import FMttM from '../js/conductor.js';

// React.renderToString takes your component and generates rendered markup. SEO friendliness all the way
module.exports = function(app) {
	app.get('/fly-me-to-the-moon/', function(req, res) {
		res.render('index.ejs', {
			reactTitle: JsonData.home.title,
			reactDescription: JsonData.home.description,
			reactOutput: ReactDOM.renderToString(React.createElement(FMttM, JsonData.home ))
		});
	});

	app.get('/fly-me-to-the-moon/:section', function(req, res) {
		res.render('index.ejs', {
			reactTitle: JsonData[req.params.section].title,
			reactDescription: JsonData[req.params.section].description,
			reactOutput: ReactDOM.renderToString(React.createElement(FMttM, JsonData[req.params.section] ))
		});
	});
}