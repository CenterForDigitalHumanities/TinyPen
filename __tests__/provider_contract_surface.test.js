import assert from "node:assert/strict"
import test from "node:test"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "..")

const appPath = path.join(repoRoot, "app.js")
const contractPath = path.join(repoRoot, "openapi", "contracts", "tpen-services-to-tinypen.openapi.yaml")
const externalContractPath = path.join(repoRoot, "openapi", "external", "tpen-services-to-tinynode.openapi.yaml")

const httpMethods = new Set(["get", "put", "post", "delete", "patch", "options", "head", "trace"])

function normalizePathParam(routePath) {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, "{$1}")
}

function joinPath(prefix, routePath) {
  const normalizedPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix
  const normalizedRoutePath = routePath === "/" ? "" : routePath
  const combined = `${normalizedPrefix}${normalizedRoutePath}`
  return normalizePathParam(combined.replace(/\/+/g, "/"))
}

function parseRouteOperations(routeFilePath, prefix) {
  const source = fs.readFileSync(routeFilePath, "utf8")
  const operations = new Set()

  const routeBlockPattern = /router\.route\('([^']+)'\)([\s\S]*?)(?=\nrouter\.route\(|\nexport default)/g
  for (const match of source.matchAll(routeBlockPattern)) {
    const routePath = joinPath(prefix, match[1])
    const methods = new Set()
    for (const methodMatch of match[2].matchAll(/\.(get|put|post|delete|patch|options|head|trace)\(/g)) {
      methods.add(methodMatch[1].toUpperCase())
    }
    for (const method of methods) {
      operations.add(`${method} ${routePath}`)
    }
  }

  const directPattern = /router\.(get|put|post|delete|patch|options|head|trace)\('([^']+)'/g
  for (const match of source.matchAll(directPattern)) {
    const method = match[1]
    const routePath = match[2]
    if (!httpMethods.has(method)) continue
    operations.add(`${method.toUpperCase()} ${joinPath(prefix, routePath)}`)
  }

  return operations
}

function getMountedOperations() {
  const appSource = fs.readFileSync(appPath, "utf8")

  const importMap = new Map()
  const importPattern = /^import\s+(\w+)\s+from\s+"\.\/routes\/(\w+)\.js"$/gm
  for (const match of appSource.matchAll(importPattern)) {
    importMap.set(match[1], path.join(repoRoot, "routes", `${match[2]}.js`))
  }

  const operations = new Set()
  const mountPattern = /app\.use\('([^']+)',\s*(\w+)\)/g
  for (const match of appSource.matchAll(mountPattern)) {
    const prefix = match[1]
    const routerName = match[2]
    const routeFilePath = importMap.get(routerName)
    if (!routeFilePath) continue

    for (const operation of parseRouteOperations(routeFilePath, prefix)) {
      operations.add(operation)
    }
  }

  return Array.from(operations).sort()
}

function getContractOperations() {
  const lines = fs.readFileSync(contractPath, "utf8").split("\n")
  const pathEntries = new Map()
  let currentPath = ""

  for (const line of lines) {
    const pathMatch = line.match(/^  (\/[^:]+):\s*$/)
    if (pathMatch) {
      currentPath = pathMatch[1]
      pathEntries.set(currentPath, {
        methods: new Set(),
        ref: null
      })
      continue
    }

    if (!currentPath || !pathEntries.has(currentPath)) continue
    const entry = pathEntries.get(currentPath)

    const refMatch = line.match(/^    \$ref:\s*(.+)$/)
    if (refMatch) {
      entry.ref = refMatch[1].trim()
      continue
    }

    const methodMatch = line.match(/^    (get|put|post|delete|patch|options|head|trace):\s*$/)
    if (methodMatch) {
      entry.methods.add(methodMatch[1].toUpperCase())
    }
  }

  return pathEntries
}

function getExternalMirrorOperations() {
  const lines = fs.readFileSync(externalContractPath, "utf8").split("\n")
  const operations = new Set()
  let currentPath = ""

  for (const line of lines) {
    const pathMatch = line.match(/^  (\/[^:]+):\s*$/)
    if (pathMatch) {
      currentPath = pathMatch[1]
      continue
    }

    const methodMatch = line.match(/^    (get|put|post|delete|patch|options|head|trace):\s*$/)
    if (methodMatch && currentPath) {
      operations.add(`${methodMatch[1].toUpperCase()} ${currentPath}`)
    }
  }

  return operations
}

test("provider contract documents every mounted route path", () => {
  const contractPaths = Array.from(getContractOperations().keys()).sort()
  const mountedPaths = Array.from(new Set(getMountedOperations().map((operation) => operation.split(" ")[1]))).sort()
  assert.deepEqual(contractPaths, mountedPaths)
})

test("provider contract defines local methods for TinyPen-specific path items", () => {
  const contractOperations = getContractOperations()

  for (const mountedOperation of getMountedOperations()) {
    const [method, operationPath] = mountedOperation.split(" ")
    const entry = contractOperations.get(operationPath)
    assert.ok(entry)

    if (entry.ref) continue
    assert.equal(entry.methods.has(method), true)
  }
})

test("provider contract imports TinyNode core path items for shared endpoints", () => {
  const coreBaseline = "../external/tpen-services-to-tinynode.openapi.yaml#/paths"
  const contractOperations = getContractOperations()
  assert.equal(contractOperations.get("/query")?.ref, `${coreBaseline}/~1query`)
  assert.equal(contractOperations.get("/update")?.ref, `${coreBaseline}/~1update`)
})

test("provider contract keeps the local TinyNode mirror usable for imported operations", () => {
  const externalOperations = getExternalMirrorOperations()
  assert.equal(externalOperations.has("POST /query"), true)
  assert.equal(externalOperations.has("PUT /update"), true)
})
