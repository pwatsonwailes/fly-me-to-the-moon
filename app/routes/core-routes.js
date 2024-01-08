import React from 'react';
import { renderToString } from 'react-dom/server';
import JsonData from '../json/data.json';
import FMttM from '../js/conductor.js';

export default function(app) {
  app.get('/', (req, res) => {
  	const reactTitle = JsonData.home.title,
  				reactDescription = JsonData.home.description,
  				reactSection = JsonData[req.params]

  	const reactOutput = renderToString(<FMttM {...JsonData.home} />)

    res.render('index.ejs', { reactTitle, reactSection, reactDescription, reactOutput });
  });

  app.get('/:section', (req, res) => {
  	const reactTitle = JsonData[req.params.section].title,
  				reactDescription = JsonData[req.params.section].description,
  				reactSection = req.params.section

  	const reactOutput = renderToString(<FMttM {...JsonData[req.params.section]} />)

    res.render('index.ejs', { reactTitle, reactSection, reactDescription, reactOutput });
  });
}
