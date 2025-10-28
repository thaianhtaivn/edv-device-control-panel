const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
      definition: {
            openapi: "3.0.0",
            info: {
                  title: "IoT Device API",
                  version: "1.0.0",
                  description: "API for managing IoT devices"
            },
            servers: [
                  {
                        url: "/",
                        description: "API Server"
                  }
            ]
      },
      // Explicitly specify route files instead of using glob patterns for Vercel compatibility
      apis: [
            path.join(__dirname, './deviceRoutes.js'),
            path.join(__dirname, './deviceOTARoutes.js'),
            path.join(__dirname, './userRoutes.js')
      ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
