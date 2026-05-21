import { describe, it } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

const sharedArtifactPath = path.join(repoRoot, "openapi", "components", "tinypen-shared-components.openapi.yaml")
const providerContractPath = path.join(repoRoot, "openapi", "contracts", "tpen-services-to-tinypen.openapi.yaml")
const sharedWorkflowPath = path.join(repoRoot, ".github", "workflows", "sync_tinypen_shared_openapi.yaml")
const providerWorkflowPath = path.join(repoRoot, ".github", "workflows", "sync_tinypen_provider_contract.yaml")

describe("Shared OpenAPI artifact sync scaffolding.", () => {
  it("the canonical shared components artifact has valid OpenAPI structure.  __exists __core", () => {
    const artifact = fs.readFileSync(sharedArtifactPath, "utf8")
    assert.match(artifact, /^openapi: 3\.\d+\.\d+/m, "artifact must declare an openapi 3.x version")
    assert.match(artifact, /^\s+title: \S/m, "artifact info.title must be present and non-empty")
    assert.match(artifact, /^\s+version: \d+\.\d+\.\d+/m, "artifact info.version must be a semver-style string")
    assert.match(artifact, /^components:/m, "artifact must define a top-level components section")
  })

  it("the canonical provider contract has valid OpenAPI structure.  __exists __core", () => {
    const contract = fs.readFileSync(providerContractPath, "utf8")
    assert.match(contract, /^openapi: 3\.\d+\.\d+/m, "contract must declare an openapi 3.x version")
    assert.match(contract, /^\s+title: \S/m, "contract info.title must be present and non-empty")
    assert.match(contract, /^\s+version: \d+\.\d+\.\d+/m, "contract info.version must be a semver-style string")
    assert.match(contract, /^paths:/m, "contract must define a paths section")
  })

  it("the shared-components sync workflow checks out the correct receiver and copies to the right target.  __exists __core", () => {
    const workflow = fs.readFileSync(sharedWorkflowPath, "utf8")
    assert.match(workflow, /repository:\s*cubap\/rerum_openapi/, "workflow must check out cubap/rerum_openapi as the receiver")
    assert.match(
      workflow,
      /openapi\/components\/tinypen-shared-components\.openapi\.yaml/,
      "workflow must reference the canonical shared-components source path"
    )
    assert.match(
      workflow,
      /schemas\/openapi\/tinypen-shared-components\.openapi\.yaml/,
      "workflow must reference the receiver shared-components target path"
    )
    assert.match(
      workflow,
      /cp\s+openapi\/components\/tinypen-shared-components\.openapi\.yaml\s+\S*schemas\/openapi\/tinypen-shared-components\.openapi\.yaml/,
      "workflow's cp command must copy from the canonical source to the receiver target — a retargeted copy would silently corrupt the receiver"
    )
  })

  it("the provider-contract sync workflow checks out the correct receiver and copies to the right target.  __exists __core", () => {
    const workflow = fs.readFileSync(providerWorkflowPath, "utf8")
    assert.match(workflow, /repository:\s*cubap\/rerum_openapi/, "workflow must check out cubap/rerum_openapi as the receiver")
    assert.match(
      workflow,
      /openapi\/contracts\/tpen-services-to-tinypen\.openapi\.yaml/,
      "workflow must reference the canonical provider-contract source path"
    )
    assert.match(
      workflow,
      /seams\/tpen-services-to-tinypen\/openapi\/baseline\.openapi\.yaml/,
      "workflow must reference the receiver provider-contract target path"
    )
    assert.match(
      workflow,
      /cp\s+openapi\/contracts\/tpen-services-to-tinypen\.openapi\.yaml\s+\S*seams\/tpen-services-to-tinypen\/openapi\/baseline\.openapi\.yaml/,
      "workflow's cp command must copy from the canonical source to the receiver target — a retargeted copy would silently corrupt the receiver"
    )
  })

  it("both sync workflows pin peter-evans/create-pull-request and use the expected org secret.  __exists __core", () => {
    for (const workflowPath of [sharedWorkflowPath, providerWorkflowPath]) {
      const workflow = fs.readFileSync(workflowPath, "utf8")
      assert.match(
        workflow,
        /peter-evans\/create-pull-request@v\d+/,
        `${path.basename(workflowPath)} must pin a major version of peter-evans/create-pull-request`
      )
      assert.match(
        workflow,
        /secrets\.OPENAPI(?!\w)/,
        `${path.basename(workflowPath)} must read the org-level secret named OPENAPI — a rename here breaks the sync silently at the receiver checkout step`
      )
    }
  })
})
