/**
 * Detects multiple MIME types smuggled into a single Content-Type header.
 * The following are the cases that should result in a 415 (not a 500)

  - application/json text/plain
  - application/json, text/plain
  - text/plain; application/json
  - text/plain; a=b, application/json
  - application/json; a=b; text/plain;
  - application/json; a=b text/plain;
  - application/json; charset=utf-8, text/plain
  - application/json;
 
 * @param {string} contentType - Lowercased Content-Type header value
 * @returns {boolean} True if multiple MIME types are detected
 */
const hasMultipleContentTypes = (contentType) => {
    const segments = contentType.split(";")
    const mimeSegment = segments[0].trim()
    // No commas or spaces allowed in MIME types
    if (mimeSegment.includes(",") || mimeSegment.includes(" ")) return true
    // Parameter values are tokens (no spaces/commas) or quoted strings per RFC 2045.
    // Commas or spaces outside quotes indicate a smuggled MIME type.
    return segments.slice(1).some(segment => {
        const trimmed = segment.trim()
        if (!trimmed.includes("=")) return true
        const withoutQuoted = trimmed.replace(/"[^"]*"/g, "")
        if (withoutQuoted.includes(",") || withoutQuoted.includes(" ")) return true
        return false
    })
}

const DEFAULT_MAX_QUERY_LIMIT = 500
const DEFAULT_MAX_QUERY_SKIP = 100000

/**
 * Parse and bound query pagination values.
 *
 * @param {Object} [query={}] - Request query object
 * @param {number} [defaultLimit=10] - Default limit when omitted
 * @returns {{limit:number, skip:number}}
 * @throws {Error} If limit or skip are not non-negative integers
 */
const getPagination = (query = {}, defaultLimit = 10) => {
    const maxLimit = Number.parseInt(process.env.RERUM_MAX_QUERY_LIMIT ?? `${DEFAULT_MAX_QUERY_LIMIT}`, 10)
    const maxSkip = Number.parseInt(process.env.RERUM_MAX_QUERY_SKIP ?? `${DEFAULT_MAX_QUERY_SKIP}`, 10)
    const safeMaxLimit = Number.isFinite(maxLimit) && maxLimit > 0 ? maxLimit : DEFAULT_MAX_QUERY_LIMIT
    const safeMaxSkip = Number.isFinite(maxSkip) && maxSkip >= 0 ? maxSkip : DEFAULT_MAX_QUERY_SKIP

    const parseNonNegativeInteger = (value, fallback) => {
        if (value === undefined || value === null || value === "") return fallback
        const normalized = `${value}`.trim()
        if (!/^\d+$/.test(normalized)) return null
        return Number.parseInt(normalized, 10)
    }

    const limit = parseNonNegativeInteger(query.limit, defaultLimit)
    const skip = parseNonNegativeInteger(query.skip, 0)

    if (limit === null || skip === null) {
        const err = new Error("`limit` and `skip` values must be non-negative integers or omitted.")
        err.status = 400
        throw err
    }

    return {
        limit: Math.min(limit, safeMaxLimit),
        skip: Math.min(skip, safeMaxSkip)
    }
}

/**
 * Middleware to verify Content-Type headers for endpoints receiving JSON bodies.
 * Responds with a 415 Invalid Media Type for Content-Type headers that are not for JSON bodies.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyJsonContentType = function (req, res, next) {
    const contentType = (req.get("Content-Type") ?? "").toLowerCase()
    const mimeType = contentType.split(";")[0].trim()
    if (!mimeType) {
        const err = new Error(`Missing or empty Content-Type header.`)
        err.status = 415
        return next(err)
    }
    if (hasMultipleContentTypes(contentType)) {
        const err = new Error(`Multiple Content-Type values are not allowed. Provide exactly one Content-Type header.`)
        err.status = 415
        return next(err)
    }
    if (mimeType === "application/json" || mimeType === "application/ld+json") return next()
    const err = new Error(`Unsupported Content-Type: ${contentType}. This endpoint requires application/json or application/ld+json.`)
    err.status = 415
    return next(err)
}

export default {
    getPagination,
    verifyJsonContentType
}
