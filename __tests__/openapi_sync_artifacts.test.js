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

  it("the shared-components sync workflow dispatches the correct receiver workflow with correct inputs.  __exists __core", () => {
    const workflow = fs.readFileSync(sharedWorkflowPath, "utf8")
    assert.match(workflow, /workflow_id:\s*['"]?sync-provider-artifact\.yml['"]?/, "workflow must dispatch sync-provider-artifact.yml in the receiver")
    assert.match(workflow, /owner:\s*['"]?cubap['"]?/, "workflow must dispatch into cubap/rerum_openapi (owner: cubap)")
    assert.match(workflow, /repo:\s*['"]?rerum_openapi['"]?/, "workflow must dispatch into cubap/rerum_openapi (repo: rerum_openapi)")
    assert.match(
      workflow,
      /provider_artifact_path:\s*['"]?openapi\/components\/tinypen-shared-components\.openapi\.yaml['"]?/,
      "workflow must reference the canonical shared-components source path"
    )
    assert.match(
      workflow,
      /target_artifact_path:\s*['"]?schemas\/openapi\/tinypen-shared-components\.openapi\.yaml['"]?/,
      "workflow must reference the receiver shared-components target path"
    )
  })

  it("the provider-contract sync workflow dispatches the correct receiver workflow with correct inputs.  __exists __core", () => {
    const workflow = fs.readFileSync(providerWorkflowPath, "utf8")
    assert.match(workflow, /workflow_id:\s*['"]?sync-provider-artifact\.yml['"]?/, "workflow must dispatch sync-provider-artifact.yml in the receiver")
    assert.match(workflow, /owner:\s*['"]?cubap['"]?/, "workflow must dispatch into cubap/rerum_openapi (owner: cubap)")
    assert.match(workflow, /repo:\s*['"]?rerum_openapi['"]?/, "workflow must dispatch into cubap/rerum_openapi (repo: rerum_openapi)")
    assert.match(
      workflow,
      /provider_artifact_path:\s*['"]?openapi\/contracts\/tpen-services-to-tinypen\.openapi\.yaml['"]?/,
      "workflow must reference the canonical provider-contract source path"
    )
    assert.match(
      workflow,
      /target_artifact_path:\s*['"]?seams\/tpen-services-to-tinypen\/openapi\/baseline\.openapi\.yaml['"]?/,
      "workflow must reference the receiver provider-contract target path"
    )
  })

  it("both sync workflows use the expected org-level secret.  __exists __core", () => {
    for (const workflowPath of [sharedWorkflowPath, providerWorkflowPath]) {
      const workflow = fs.readFileSync(workflowPath, "utf8")
      assert.match(
        workflow,
        /secrets\.OPENAPI(?!\w)/,
        `${path.basename(workflowPath)} must read the org-level secret named OPENAPI — a rename here breaks the dispatch silently`
      )
    }
  })
})
