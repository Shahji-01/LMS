import { AppError } from "../utils/appError.js";

/**
 * Zod validation middleware factory
 * @param {ZodSchema} schema - Zod schema for req.body
 * @param {'body'|'query'|'params'} source
 */
export const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));
            return next(
                new AppError(422, "Validation failed", null, errors)
            );
        }
        req[source] = result.data;
        next();
    };
};
