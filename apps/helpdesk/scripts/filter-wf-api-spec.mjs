#!/usr/bin/env node
/**
 * Strips paths (and orphaned schemas) from `wf-api.openapi.json` so that:
 *   - Future runs of `pnpm wf-api:fetch-openapi` don't reintroduce endpoints
 *     already migrated to `@gorgias/workflows-*` (SPLTFE-2632 migration).
 *   - `pnpm wf-api:generate-types` produces a `client.generated.d.ts` that's
 *     free of the migrated types.
 *
 * Add a path here every time an endpoint family lands on the SDK. Schemas no
 * longer reachable from any remaining path are removed automatically.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SPEC_PATH = path.resolve(
    __dirname,
    '../src/rest_api/workflows_api/wf-api.openapi.json',
)

// Migrated endpoint paths to strip from the spec.
// Group entries by the PR/endpoint-family that removed them.
const REMOVED_PATHS = [
    // Trackstar — SPLTFE-2632 (PR: workflows Trackstar migration)
    '/trackstar/link/{connection_id}',
    '/trackstar/token',
    '/trackstar/service-connection',
    '/trackstar/stores/{store_type}/{store_name}/connections',
    '/trackstar/webhook',
]

const SCHEMA_REF_PREFIX = '#/components/schemas/'

function collectSchemaRefs(node, refs) {
    if (Array.isArray(node)) {
        for (const item of node) collectSchemaRefs(item, refs)
        return
    }
    if (node === null || typeof node !== 'object') return
    for (const [key, value] of Object.entries(node)) {
        if (
            key === '$ref' &&
            typeof value === 'string' &&
            value.startsWith(SCHEMA_REF_PREFIX)
        ) {
            refs.add(value.slice(SCHEMA_REF_PREFIX.length))
        } else {
            collectSchemaRefs(value, refs)
        }
    }
}

function computeReachableSchemas(spec) {
    const reachable = new Set()
    const worklist = []

    const seed = new Set()
    collectSchemaRefs(spec.paths ?? {}, seed)
    for (const name of seed) {
        reachable.add(name)
        worklist.push(name)
    }

    while (worklist.length > 0) {
        const name = worklist.pop()
        const schema = spec.components?.schemas?.[name]
        if (!schema) continue
        const inner = new Set()
        collectSchemaRefs(schema, inner)
        for (const ref of inner) {
            if (!reachable.has(ref)) {
                reachable.add(ref)
                worklist.push(ref)
            }
        }
    }

    return reachable
}

const raw = fs.readFileSync(SPEC_PATH, 'utf8')
const spec = JSON.parse(raw)

const removedPathsFound = []
const missingPaths = []
for (const p of REMOVED_PATHS) {
    if (spec.paths && p in spec.paths) {
        delete spec.paths[p]
        removedPathsFound.push(p)
    } else {
        missingPaths.push(p)
    }
}

const schemasBefore = Object.keys(spec.components?.schemas ?? {}).length
const reachable = computeReachableSchemas(spec)
const removedSchemas = []
if (spec.components?.schemas) {
    for (const name of Object.keys(spec.components.schemas)) {
        if (!reachable.has(name)) {
            delete spec.components.schemas[name]
            removedSchemas.push(name)
        }
    }
}

// Write minified — oxfmt (chained in the package.json script) handles
// canonical formatting so the diff against the unfiltered spec is minimal.
fs.writeFileSync(SPEC_PATH, JSON.stringify(spec))

const log = (...args) => process.stderr.write(args.join(' ') + '\n')
log(`filter-wf-api-spec: removed ${removedPathsFound.length} path(s):`)
for (const p of removedPathsFound) log(`  - ${p}`)
if (missingPaths.length > 0) {
    log(
        `filter-wf-api-spec: ${missingPaths.length} path(s) listed but not present in spec (already filtered?):`,
    )
    for (const p of missingPaths) log(`  - ${p}`)
}
log(
    `filter-wf-api-spec: removed ${removedSchemas.length} orphan schema(s) (kept ${
        schemasBefore - removedSchemas.length
    }/${schemasBefore}):`,
)
for (const s of removedSchemas) log(`  - ${s}`)
