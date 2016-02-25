import React from 'react';
import ReactDOM from 'react-dom';
import JsonData from './json/data.json';
import FMttM from './js/conductor.js';

window.app = (function() {
	var requiredFeatures = {
		"JSON decoding": window.JSON,
		"the selectors API": document.querySelector,
		"DOM level 2 events": window.addEventListener,
		"the HTML5 history API": window.history.pushState
	};

	for (var i = requiredFeatures.length - 1; i >= 0; i--) {
		if (!requiredFeatures[i])
			return alert("Sorry, but your browser does not support " + feature + " so this app won't work properly.");
	}

	var fmttmElement = document.getElementById('fmttm');

	if (String(window.location.pathname).match(/\/fly-me-to-the-moon\/.+/i) !== null) {
		var section = window.location.pathname.replace('/fly-me-to-the-moon/', '').split('/')[0];
		return ReactDOM.render(React.createElement(FMttM, JsonData[section]), fmttmElement);
	}
	else {
		return ReactDOM.render(React.createElement(FMttM, JsonData['home']), fmttmElement);
	}
})();