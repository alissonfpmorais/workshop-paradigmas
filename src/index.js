const express = require('express');
const bodyParser = require('body-parser')
const apiRoutes = require('./routes.js');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api', apiRoutes);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
