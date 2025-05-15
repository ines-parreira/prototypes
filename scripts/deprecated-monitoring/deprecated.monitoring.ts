import fs from 'fs'
import path from 'path'

import { main } from '@gorgias/static-analysis'

import config from '../../sa.config'
import { Entry, JSONEntry, JSONReport } from './deprecated.types'

const SNAPSHOT_PATH = path.resolve(__dirname, 'deprecated.snapshot.json')

const results = main({
    sourceDir: config.sourceDir,
    adapter: config.adapter,
    rules: config.rules,
})

if (!results) {
    console.error('No results found')
    process.exit(1)
}

if (!fs.existsSync(SNAPSHOT_PATH)) {
    // eslint-disable-next-line no-console
    console.log('No snapshot found, creating new one')
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(results, null, 2))
    process.exit(0)
}

const newDeprecatedEntries: Array<{
    oldEntry: JSONEntry
    newEntry: Entry
}> = []

const snapshot = JSON.parse(
    fs.readFileSync(SNAPSHOT_PATH, 'utf8'),
) as JSONReport

for (const entryGroup of snapshot.entries) {
    for (const oldEntry of entryGroup.entries) {
        const newEntry = results.get(oldEntry.name)
        if (!newEntry) {
            continue
        }
        if (oldEntry.usageCount < newEntry.usageCount) {
            newDeprecatedEntries.push({
                oldEntry,
                newEntry,
            })
        }
    }
}

if (newDeprecatedEntries.length > 0) {
    // eslint-disable-next-line no-console
    console.log('New deprecated entries found')
    // eslint-disable-next-line no-console
    console.table(
        newDeprecatedEntries.map(({ oldEntry, newEntry }) => ({
            name: oldEntry.name,
            usageCount: oldEntry.usageCount,
            newUsageCount: newEntry.usageCount,
        })),
    )
    process.exit(1)
} else {
    // eslint-disable-next-line no-console
    console.log('No new deprecated entries found')
    process.exit(0)
}
