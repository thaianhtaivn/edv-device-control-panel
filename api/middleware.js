const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

function setupMiddleware(app) {
      app.use(cors());
      app.use(helmet());
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.set('view engine', 'ejs');
      app.set('views', path.join(__dirname, './views'));
      app.use(express.static(path.join(__dirname, './public')));
}

module.exports = setupMiddleware;
