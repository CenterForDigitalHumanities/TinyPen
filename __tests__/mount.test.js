import assert from "node:assert/strict"
import { describe, it } from "node:test"

process.env.OPEN_API_CORS ??= "true"
const { default: app } = await import("../app.js")

/**
 * Check if a route exists in the Express app
 * Routes are checked by testing the matcher functions on each layer.
 * This is the Express 5.x compatible approach.
 *
 * @param {Array<string>} routes - Array of route paths to check
 * @returns {boolean} - True if all routes are found
 */
function routeExists(routes) {
  const stack = app.router.stack
  const foundRoutes = new Set()
  for (const layer of stack) {
    if (layer.matchers && layer.matchers[0]) {
      const matcher = layer.matchers[0]
      // Test each route against this layer's matcher
      for (const route of routes) {
        if (matcher(route)) foundRoutes.add(route)
      }
    }
    // Also check route.path directly if it exists
    if (layer.route && layer.route.path) {
      for (const route of routes) {
        if (layer.route.path === route) foundRoutes.add(route)
      }
    }
  }
  return routes.every(route => foundRoutes.has(route))
}

/**
 * This test suite uses the built app.js app and checks that the expected create endpoints are registered.
 *  - /create
 *  - /app/create
 */
describe("Check that the expected TinyPen create route patterns are registered.", () => {
  it("'/app/create' and '/create' are registered routes in the app.  __exists __core", () => {
    assert.equal(routeExists(["/create", "/app/create"]), true)
  })
})

/**
 * This test suite uses the built app.js app and checks that the expected query endpoints are registered.
 *  - /query
 *  - /app/query
 */
describe("Check that the expected TinyPen query route patterns are registered.", () => {
  it("'/app/query' and '/query' are registered routes in the app.  __exists __core", () => {
    assert.equal(routeExists(["/query", "/app/query"]), true)
  })
})

/**
 * This test suite uses the built app.js app and checks that the expected update endpoints are registered.
 *  - /update
 *  - /app/update
 */
describe("Check that the expected TinyPen update route patterns are registered.", () => {
  it("'/app/update' and '/update' are registered routes in the app.  __exists __core", () => {
    assert.equal(routeExists(["/update", "/app/update"]), true)
  })
})


/**
 * This test suite uses the built app.js app and checks that the expected overwrite endpoints are registered.
 *  - /overwrite
 *  - /app/overwrite
 */
describe("Check that the expected TinyPen overwrite route patterns are registered.", () => {
  it("'/app/overwrite' and '/overwrite' are registered routes in the app.  __exists __core", () => {
    assert.equal(routeExists(["/overwrite", "/app/overwrite"]), true)
  })
})

/**
 * This test suite uses the built app.js app and checks that the expected delete endpoints are registered.
 *  - /delete
 *  - /app/delete
 */
describe("Combined unit tests for the '/delete' route.", () => {
  it("'/app/delete' and '/delete' are registered routes in the app.  __exists __core", () => {
    assert.equal(routeExists(["/delete", "/app/delete"]), true)
  })
})
