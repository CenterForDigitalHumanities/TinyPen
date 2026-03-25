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
        return next(utils.createExpressError({
            statusCode: 415,
            statusMessage: `Missing or empty Content-Type header.`
        }))
    }
    if (hasMultipleContentTypes(contentType)) {
        return next(utils.createExpressError({
            statusCode: 415,
            statusMessage: `Multiple Content-Type values are not allowed. Provide exactly one Content-Type header.`
        }))
    }
    if (mimeType === "application/json" || mimeType === "application/ld+json") return next()
    return next(utils.createExpressError({
        statusCode: 415,
        statusMessage: `Unsupported Content-Type: ${contentType}. This endpoint requires application/json or application/ld+json.`
    }))
}

export default { verifyJsonContentType }
