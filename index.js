// Load Node Modules
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
// Load App Modules
const errorHandler = require('./module/errorHandler');
const user = require('./api');
// Declare App Variables
const PORT = process.env.PORT || 5000;

// Setting
if( !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  require('dotenv').load();
}

if (process.env.NODE_ENV == 'production') {
  console.log("Production Mode");
} else if (process.env.NODE_ENV == 'development') {
  console.log("Development Mode");
} else {
  console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
}
console.log('connectionString: ', process.env.DATABASE_URL);

app.use(cors());
app.use(bodyParser.json());

// APIs
app.use('/api', user);

// Error Handler
app.use( function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

module.exports = app;