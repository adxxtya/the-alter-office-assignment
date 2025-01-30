import swaggerjsdoc from "swagger-jsdoc";
import * as swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Short URL Gen API",
      version: "1.0.0",
      description: "API Documentation for Alter Office Assignment",
      contact: {
        name: "Aditya Maurya",
        email: "maurya.aditya61918@gmail.com",
      },
    },
    servers: [
      {
        url: "https://the-alter-office-assignment.onrender.com",
      },
      {
        url: "http://localhost:3000/",
      },
    ],
  },
  apis: ["./src/routes.ts"],
};

export const swaggerSpecs = swaggerjsdoc(options);

export function swaggerDocs(app, port) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpecs);
  });
}
