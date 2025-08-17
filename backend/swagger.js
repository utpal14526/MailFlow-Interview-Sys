import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MailFlow - Email Marketing API",
      version: "1.0.0",
      description:
        "API documentation for MailFlow Email Marketing backend project.\n\n" +
        "All endpoints require JWT Bearer Token Authentication**. " +
        "Please  Pass Token Only to Authorize",
    },
    servers: [
      {
        url: "http://localhost:5002/api",
        description: "Local Development Server",
      },
      {
        url: "https://mailflow-interview-sys-production-23b1.up.railway.app/api",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Contact: {
          type: "object",
          properties: {
            _id: { type: "string", example: "689aec01ca86deaa1530da43" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            owner: { type: "string", example: "689aebf7ca86deaa1530da3a" },
            createdAt: {
              type: "string",
              example: "2025-08-12T07:23:45.312+00:00",
              format: "date-time",
            },
          },
        },
        Campaign: {
          type: "object",
          properties: {
            _id: { type: "string", example: "689aec01ca86deaa1530da43" },
            owner: { type: "string", example: "689aec01ca86deaa1530da43" },
            subject: { type: "string", example: "Welcome to MailFlow" },
            body: {
              type: "string",
              example: "Hello, thanks for joining our platform!",
            },
            taggedContacts: {
              type: "array",
              items: { type: "string", example: "689aec01ca86deaa1530da43" },
            },
            statusOfCampaign: {
              type: "string",
              enum: ["sent", "draft", "failed", "in-progress"],
              example: "draft",
            },
            name: { type: "string", example: "Onboarding Campaign" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "689aec01ca86deaa1530da43" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            createdAt: {
              type: "string",
              example: "2025-08-12T07:23:45.312+00:00",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
