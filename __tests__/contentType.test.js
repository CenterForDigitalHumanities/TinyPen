/**
 * Content-Type Header Validation Tests
 *
 * Verifies that TinyPEN properly validates Content-Type headers
 * on incoming requests, returning 415 for missing/blank/unsupported types,
 * 400 for malformed multi-value headers, and passing through valid types.
 */

import request from "supertest"
import { jest } from "@jest/globals"
import app from "../app.js"

beforeEach(() => {
  checkAccessToken = jest.fn((req, res, next) => next())
  isTokenExpired = jest.fn(() => false)
})

describe("Content-Type validation on POST routes", () => {

  it("accepts application/json __contentType __core", async () => {
    const res = await request(app)
      .post("/query")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ type: "test" }))
    expect(res.status).not.toBe(415)
    expect(res.status).not.toBe(400)
  })

  it("accepts application/ld+json __contentType __core", async () => {
    const res = await request(app)
      .post("/query")
      .set("Content-Type", "application/ld+json")
      .send(JSON.stringify({ type: "test" }))
    expect(res.status).not.toBe(415)
    expect(res.status).not.toBe(400)
  })

  it("accepts application/json with charset parameter __contentType", async () => {
    const res = await request(app)
      .post("/query")
      .set("Content-Type", "application/json; charset=utf-8")
      .send(JSON.stringify({ type: "test" }))
    expect(res.status).not.toBe(415)
    expect(res.status).not.toBe(400)
  })

  it("accepts Content-Type case-insensitively __contentType", async () => {
    const res = await request(app)
      .post("/query")
      .set("Content-Type", "Application/JSON")
      .send(JSON.stringify({ type: "test" }))
    expect(res.status).not.toBe(415)
    expect(res.status).not.toBe(400)
  })

  it("returns 415 for missing Content-Type on POST __contentType __core", async () => {
    const res = await request(app)
      .post("/query")
      .unset("Content-Type")
      .send(Buffer.from(JSON.stringify({ type: "test" })))
    expect(res.status).toBe(415)
    expect(res.text).toMatch(/Unsupported Media Type/i)
  })

  it("returns 415 for blank Content-Type on POST __contentType", async () => {
    const res = await request(app)
      .post("/query")
      .set("Content-Type", "")
      .send(Buffer.from(JSON.stringify({ type: "test" })))
    expect(res.status).toBe(415)
    expect(res.text).toMatch(/Unsupported Media Type/i)
  })

  it("returns 415 for text/plain __contentType", async () => {
    const res = await request(app)
      .post("/query")
      .set("Content-Type", "text/plain")
      .send("some text")
    expect(res.status).toBe(415)
    expect(res.text).toMatch(/Unsupported Media Type/i)
  })

  it("returns 415 for text/html __contentType", async () => {
    const res = await request(app)
      .post("/query")
      .set("Content-Type", "text/html")
      .send("<html></html>")
    expect(res.status).toBe(415)
    expect(res.text).toMatch(/Unsupported Media Type/i)
  })

  it("returns 415 for multipart/form-data __contentType", async () => {
    const res = await request(app)
      .post("/query")
      .set("Content-Type", "multipart/form-data")
      .send("--boundary--")
    expect(res.status).toBe(415)
    expect(res.text).toMatch(/Unsupported Media Type/i)
  })

  it("returns 400 for duplicate/multi-value Content-Type headers __contentType __core", async () => {
    // Node.js joins duplicate headers with ", " so this simulates that
    const res = await request(app)
      .post("/query")
      .set("Content-Type", "application/json, text/html")
      .send(JSON.stringify({ type: "test" }))
    expect(res.status).toBe(400)
    expect(res.text).toMatch(/Multiple Content-Type/i)
  })
})

describe("Content-Type validation skips non-body methods", () => {

  it("does not reject GET requests without Content-Type __contentType", async () => {
    const res = await request(app).get("/query")
    // GET /query should 404 (no GET handler), not 400/415
    expect(res.status).not.toBe(400)
    expect(res.status).not.toBe(415)
  })

  it("does not reject OPTIONS requests __contentType", async () => {
    const res = await request(app).options("/query")
    expect(res.status).not.toBe(400)
    expect(res.status).not.toBe(415)
  })

  it("does not reject HEAD requests __contentType", async () => {
    const res = await request(app).head("/query")
    expect(res.status).not.toBe(400)
    expect(res.status).not.toBe(415)
  })
})

describe("Content-Type validation on PUT routes", () => {

  it("returns 415 for text/plain on PUT /update __contentType", async () => {
    const res = await request(app)
      .put("/update")
      .set("Content-Type", "text/plain")
      .send("some text")
    expect(res.status).toBe(415)
  })

  it("returns 415 for missing Content-Type on PUT /overwrite __contentType", async () => {
    const res = await request(app)
      .put("/overwrite")
      .unset("Content-Type")
      .send(Buffer.from(JSON.stringify({ id: "test" })))
    expect(res.status).toBe(415)
  })
})

describe("Content-Type validation skips DELETE routes", () => {

  it("does not reject DELETE /delete/:id without Content-Type __contentType", async () => {
    const res = await request(app)
      .delete("/delete/some-fake-id")
    expect(res.status).not.toBe(400)
    expect(res.status).not.toBe(415)
  })
})
