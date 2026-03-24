/**
 * This module is used for any REST support functionality.  It is used as middleware and so
 * has access to the http module request and response objects, as well as next()
 *
 * @author thehabes
 */

/**
 * Validate Content-Type header on requests.
 * Rejects missing, blank, duplicate, or unsupported Content-Type with 415.
 * Accepts application/json and application/ld+json (with optional parameters like charset).
 */
const ALLOWED_CONTENT_TYPES = ['application/json', 'application/ld+json']
function jsonContent(req, res, next) {
  const rawContentType = req.headers['content-type']
  if (!rawContentType || !rawContentType.trim()) {
    return res.status(415).type('text/plain').send('Unsupported Media Type. Content-Type header is required. Expected application/json or application/ld+json.')
  }
  // Node.js/Express joins duplicate Content-Type headers with ", "
  // Content-Type is a singleton field per RFC 9110 §8.3 — multiple values are invalid
  if (rawContentType.includes(',')) {
    return res.status(415).type('text/plain').send('Unsupported Media Type. Multiple Content-Type values are not allowed. Send a single Content-Type header.')
  }
  // Strip parameters (e.g., ";charset=utf-8") and normalize
  const mediaType = rawContentType.split(';')[0].trim().toLowerCase()
  if (!ALLOWED_CONTENT_TYPES.includes(mediaType)) {
    return res.status(415).type('text/plain').send(`Unsupported Media Type: ${mediaType}. Expected application/json or application/ld+json.`)
  }
  next()
}

export default { jsonContent }
