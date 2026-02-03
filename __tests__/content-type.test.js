/**
 * Content-Type Support Tests
 *
 * Tests to verify that TinyPen properly handles different JSON content types,
 * including application/json and application/json+ld
 */

import request from "supertest"
import { jest } from "@jest/globals"

// Mock the tokens module before importing the app
const mockCheckAccessToken = jest.fn((req, res, next) => next())
jest.unstable_mockModule('../tokens.js', () => ({
  default: mockCheckAccessToken
}))

// Mock the fetch function to avoid making real API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ 
      "@id": "https://store.rerum.io/v1/id/test123",
      "test": "data" 
    }),
    text: () => Promise.resolve("Success")
  })
)

// Import app after mocking tokens
const { default: app } = await import("../app.js")

beforeEach(() => {
  // Clear mock call history
  fetch.mockClear()
  mockCheckAccessToken.mockClear()
})

/**
 * Test that query endpoint accepts application/json+ld content type
 */
describe("Query endpoint with application/json+ld", () => {
  it("should accept application/json+ld Content-Type for POST /query", async () => {
    const queryData = { "name": "test" }
    
    const response = await request(app)
      .post("/query")
      .set("Content-Type", "application/json+ld")
      .send(queryData)
    
    expect(response.status).toBe(200)
    // Verify the body was parsed correctly
    expect(fetch).toHaveBeenCalled()
    const fetchCall = fetch.mock.calls[0]
    const fetchBody = JSON.parse(fetchCall[1].body)
    expect(fetchBody).toEqual(queryData)
  })
})

/**
 * Test that create endpoint accepts application/json+ld content type
 */
describe("Create endpoint with application/json+ld", () => {
  it("should accept application/json+ld Content-Type for POST /create", async () => {
    const createData = { "name": "test", "value": "data" }
    
    const response = await request(app)
      .post("/create")
      .set("Content-Type", "application/json+ld")
      .send(createData)
    
    expect(response.status).toBe(201)
    // Verify the body was parsed correctly
    expect(fetch).toHaveBeenCalled()
    const fetchCall = fetch.mock.calls[0]
    const fetchBody = JSON.parse(fetchCall[1].body)
    expect(fetchBody).toEqual(createData)
  })
})

/**
 * Test that update endpoint accepts application/json+ld content type
 */
describe("Update endpoint with application/json+ld", () => {
  it("should accept application/json+ld Content-Type for PUT /update", async () => {
    const updateData = { "@id": "https://store.rerum.io/v1/id/test123", "name": "updated" }
    
    const response = await request(app)
      .put("/update")
      .set("Content-Type", "application/json+ld")
      .send(updateData)
    
    expect(response.status).toBe(200)
    // Verify the body was parsed correctly
    expect(fetch).toHaveBeenCalled()
    const fetchCall = fetch.mock.calls[0]
    const fetchBody = JSON.parse(fetchCall[1].body)
    expect(fetchBody).toEqual(updateData)
  })
})

/**
 * Test that overwrite endpoint accepts application/json+ld content type
 */
describe("Overwrite endpoint with application/json+ld", () => {
  it("should accept application/json+ld Content-Type for PUT /overwrite", async () => {
    const overwriteData = { "@id": "https://store.rerum.io/v1/id/test123", "name": "overwritten" }
    
    const response = await request(app)
      .put("/overwrite")
      .set("Content-Type", "application/json+ld")
      .send(overwriteData)
    
    expect(response.status).toBe(200)
    // Verify the body was parsed correctly
    expect(fetch).toHaveBeenCalled()
    const fetchCall = fetch.mock.calls[0]
    const fetchBody = JSON.parse(fetchCall[1].body)
    expect(fetchBody).toEqual(overwriteData)
  })
})

/**
 * Test that delete endpoint accepts application/json+ld content type
 */
describe("Delete endpoint with application/json+ld", () => {
  it("should accept application/json+ld Content-Type for DELETE /delete", async () => {
    const deleteData = { "@id": "https://store.rerum.io/v1/id/test123" }
    
    const response = await request(app)
      .delete("/delete")
      .set("Content-Type", "application/json+ld")
      .send(deleteData)
    
    expect(response.status).toBe(204)
    // Verify the body was parsed correctly
    expect(fetch).toHaveBeenCalled()
    const fetchCall = fetch.mock.calls[0]
    const fetchBody = JSON.parse(fetchCall[1].body)
    expect(fetchBody).toEqual(deleteData)
  })
})

/**
 * Test that application/json still works (backward compatibility)
 */
describe("Backward compatibility with application/json", () => {
  it("should still accept application/json Content-Type for POST /query", async () => {
    const queryData = { "name": "test" }
    
    const response = await request(app)
      .post("/query")
      .set("Content-Type", "application/json")
      .send(queryData)
    
    expect(response.status).toBe(200)
    expect(fetch).toHaveBeenCalled()
  })
})
