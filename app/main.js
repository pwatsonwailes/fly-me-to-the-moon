import React from 'react';
import { createRoot } from 'react-dom/client';
import JsonData from './json/data.json';
import FMttM from './js/conductor.js';

const root = createRoot(document.getElementById('fmttm'))

if (String(window.location.pathname).match(/\/fly-me-to-the-moon\/.+/i) !== null) {
	const section = window.location.pathname.replace('/fly-me-to-the-moon/', '').split('/')[0];
	root.render(<FMttM {...JsonData[section]} />)
}
else {
	root.render(<FMttM {...JsonData['home']} />)
}