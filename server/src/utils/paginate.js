/**
 * Cursor-based pagination helper for Mongoose models
 *
 * @param {Model} Model - Mongoose model
 * @param {object} filter - Query filter
 * @param {object} options - { cursor, limit, sort, populate, includeTotalCount }
 * @returns {{ data, nextCursor, totalCount }}
 */
export const paginateCursor = async (Model, filter = {}, options = {}) => {
    const { cursor, limit = 12, sort = { createdAt: -1 }, populate, includeTotalCount = false } = options;

    const query = { ...filter };

    // If cursor provided, decode and add to query
    if (cursor) {
        try {
            const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
            const sortKey = Object.keys(sort)[0];
            const sortDir = sort[sortKey];
            query[sortKey] = sortDir === -1 ? { $lt: decoded[sortKey] } : { $gt: decoded[sortKey] };
        } catch {
            // Invalid cursor — ignore and return from beginning
        }
    }

    let dbQuery = Model.find(query).sort(sort).limit(limit + 1);
    if (populate) dbQuery = dbQuery.populate(populate);

    const docs = await dbQuery;

    let nextCursor = null;
    if (docs.length > limit) {
        docs.pop();
        const lastDoc = docs[docs.length - 1];
        const sortKey = Object.keys(sort)[0];
        nextCursor = Buffer.from(JSON.stringify({ [sortKey]: lastDoc[sortKey] })).toString("base64");
    }

    const totalCount = includeTotalCount ? await Model.countDocuments(filter) : undefined;

    return { data: docs, nextCursor, totalCount };
};
