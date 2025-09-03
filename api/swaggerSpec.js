const swaggerJSDoc = require('swagger-jsdoc');

const options = {
      definition: {
            openapi: "3.0.0",
            info: {
                  title: "IoT Device API",
                  version: "1.0.0",
                  description: "API for managing IoT devices"
            }
      },
      apis: ["./**/*Routes.js"]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
