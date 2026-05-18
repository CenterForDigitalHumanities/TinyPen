import assert from "node:assert/strict"
import test from "node:test"
import rest from "../rest.js"

const originalMaxLimit = process.env.RERUM_MAX_QUERY_LIMIT
const originalMaxSkip = process.env.RERUM_MAX_QUERY_SKIP

test.afterEach(() => {
  process.env.RERUM_MAX_QUERY_LIMIT = originalMaxLimit
  process.env.RERUM_MAX_QUERY_SKIP = originalMaxSkip
})

test("rest.getPagination returns defaults when values are omitted", () => {
  const pagination = rest.getPagination({}, 10)
  assert.deepEqual(pagination, { limit: 10, skip: 0 })
})

test("rest.getPagination accepts explicit non-negative integer values", () => {
  const pagination = rest.getPagination({ limit: "25", skip: "5" }, 10)
  assert.deepEqual(pagination, { limit: 25, skip: 5 })
})

test("rest.getPagination rejects malformed values with a 400 status", () => {
  assert.throws(
    () => rest.getPagination({ limit: "12abc", skip: "0" }, 10),
    { message: "`limit` and `skip` values must be non-negative integers or omitted." }
  )
  assert.throws(
    () => rest.getPagination({ limit: "1", skip: "-2" }, 10),
    { message: "`limit` and `skip` values must be non-negative integers or omitted." }
  )
  assert.throws(
    () => rest.getPagination({ limit: "1.5", skip: "0" }, 10),
    { message: "`limit` and `skip` values must be non-negative integers or omitted." }
  )
  assert.throws(
    () => rest.getPagination({ limit: "hello", skip: "0" }, 10),
    (error) => error?.status === 400
  )
})

test("rest.getPagination caps values to configured maximums", () => {
  process.env.RERUM_MAX_QUERY_LIMIT = "50"
  process.env.RERUM_MAX_QUERY_SKIP = "100"
  const pagination = rest.getPagination({ limit: "1000", skip: "5000" }, 10)
  assert.deepEqual(pagination, { limit: 50, skip: 100 })
})
