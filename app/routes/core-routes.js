import React from 'react';
import ReactDOMServer from 'react-dom/server';
import JsonData from '../json/data.json';
import FMttM from '../js/conductor.js';

// React.renderToString takes your component and generates rendered markup. SEO friendliness all the way
export default function(app) {
  app.get('/', (req, res) => {
    res.render('index.ejs', {
      reactTitle: JsonData.home.title,
      reactSection: '',
      reactDescription: JsonData.home.description,
      reactOutput: ReactDOMServer.renderToString(<FMttM {...JsonData.home} />)
    });
  });

  app.get('/:section', (req, res) => {
    res.render('index.ejs', {
      reactTitle: JsonData[req.params.section].title,
      reactSection: req.params.section,
      reactDescription: JsonData[req.params.section].description,
      reactOutput: ReactDOMServer.renderToString(<FMttM {...JsonData[req.params.section]} />)
    });
  });
}
