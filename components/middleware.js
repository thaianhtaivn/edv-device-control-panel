const express = require('express');
const ejs = require("ejs");
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerSpec');

function setupMiddleware(app) {
      app.use(cors());
      app.use(helmet());
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.set('view engine', 'ejs');
      app.set('views', path.join(__dirname, '../components/views'));
      app.use(express.static(path.join(__dirname, '../public')));
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupMiddleware;
