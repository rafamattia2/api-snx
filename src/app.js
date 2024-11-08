const express = require('express');
const routes = require('./routes'); // Importa o arquivo index.js da pasta routes

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
