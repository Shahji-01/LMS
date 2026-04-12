import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "LearnHub LMS API",
            version: "1.0.0",
            description: "Production-grade Learning Management System API",
            contact: {
                name: "LearnHub Team",
            },
        },
        servers: [
            {
                url: "/api/v1",
                description: "API v1",
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "token",
                },
            },
            schemas: {
                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string" },
                        data: { type: "object" },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        error: {
                            type: "object",
                            properties: {
                                code: { type: "string" },
                                message: { type: "string" },
                            },
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        role: { type: "string", enum: ["student", "instructor", "admin"] },
                        avatar: { type: "string" },
                        bio: { type: "string" },
                        isEmailVerified: { type: "boolean" },
                    },
                },
                Course: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        title: { type: "string" },
                        subtitle: { type: "string" },
                        description: { type: "string" },
                        category: { type: "string" },
                        level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                        price: { type: "number" },
                        thumbnail: { type: "string" },
                        isPublished: { type: "boolean" },
                        instructor: { $ref: "#/components/schemas/User" },
                    },
                },
            },
        },
        security: [{ cookieAuth: [] }],
    },
    apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
