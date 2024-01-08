import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import coreRoutes from './app/routes/core-routes.js';

const app = express();
const ip = '0.0.0.0';
const port = 4170;

// Include static assets
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up routing
coreRoutes(app);

// Set 404
app.get('*', (req, res) => {
  res.json({
    route: 'Sorry this page does not exist!'
  });
});

app.listen(port, ip, () => {
  console.log('Server is Up and Running at Port : ' + port);
});
