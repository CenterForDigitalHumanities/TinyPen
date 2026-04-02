import rest from "../rest.js"

describe("rest.getPagination", () => {
  const originalMaxLimit = process.env.RERUM_MAX_QUERY_LIMIT
  const originalMaxSkip = process.env.RERUM_MAX_QUERY_SKIP

  afterEach(() => {
    process.env.RERUM_MAX_QUERY_LIMIT = originalMaxLimit
    process.env.RERUM_MAX_QUERY_SKIP = originalMaxSkip
  })

  it("returns defaults when values are omitted", () => {
    const pagination = rest.getPagination({}, 10)
    expect(pagination).toEqual({ limit: 10, skip: 0 })
  })

  it("accepts explicit non-negative integer values", () => {
    const pagination = rest.getPagination({ limit: "25", skip: "5" }, 10)
    expect(pagination).toEqual({ limit: 25, skip: 5 })
  })

  it("rejects malformed values with a 400 status", () => {
    expect(() => rest.getPagination({ limit: "12abc", skip: "0" }, 10)).toThrow("`limit` and `skip` values must be non-negative integers or omitted.")
    expect(() => rest.getPagination({ limit: "1", skip: "-2" }, 10)).toThrow("`limit` and `skip` values must be non-negative integers or omitted.")
    expect(() => rest.getPagination({ limit: "1.5", skip: "0" }, 10)).toThrow("`limit` and `skip` values must be non-negative integers or omitted.")
    try {
      rest.getPagination({ limit: "hello", skip: "0" }, 10)
    } catch (err) {
      expect(err.status).toBe(400)
    }
  })

  it("caps values to configured maximums", () => {
    process.env.RERUM_MAX_QUERY_LIMIT = "50"
    process.env.RERUM_MAX_QUERY_SKIP = "100"
    const pagination = rest.getPagination({ limit: "1000", skip: "5000" }, 10)
    expect(pagination).toEqual({ limit: 50, skip: 100 })
  })
})
