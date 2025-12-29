import fs from 'fs'
import path from 'path'

import { execute } from '@gorgias/static-analysis'

import config from '../../sa.config'
import type { StaticAnalysisReport } from './deprecated.types'

const SNAPSHOT_PATH = path.resolve(__dirname, 'deprecated.snapshot.json')

type IncreasedUsage = {
    filePath: string
    exportName: string
    oldCount: number
    newCount: number
    newUsages: string[]
}

function buildUsageMap(
    items: Array<{
        key: string
        exports: Array<{ name: string; files: string[] }>
    }>,
) {
    const map = new Map<string, Map<string, string[]>>()
    for (const item of items) {
        const exportsMap = new Map<string, string[]>()
        for (const exp of item.exports) {
            exportsMap.set(exp.name, exp.files)
        }
        map.set(item.key, exportsMap)
    }
    return map
}

function compareUsages(
    oldMap: Map<string, Map<string, string[]>>,
    newItems: Array<{
        key: string
        exports: Array<{ name: string; files: string[] }>
    }>,
): IncreasedUsage[] {
    const increasedUsages: IncreasedUsage[] = []

    for (const newItem of newItems) {
        const oldExportsMap = oldMap.get(newItem.key)

        for (const newExport of newItem.exports) {
            const oldFiles = oldExportsMap?.get(newExport.name) ?? []

            const oldFilesSet = new Set(oldFiles)
            const newFiles = newExport.files.filter(
                (file) => !oldFilesSet.has(file),
            )

            if (newFiles.length > 0) {
                increasedUsages.push({
                    filePath: newItem.key,
                    exportName: newExport.name,
                    oldCount: oldFiles.length,
                    newCount: newExport.files.length,
                    newUsages: newFiles,
                })
            }
        }
    }

    return increasedUsages
}

function compareSnapshots(
    oldSnapshot: StaticAnalysisReport,
    newSnapshot: StaticAnalysisReport,
): IncreasedUsage[] {
    const oldDeprecatedMap = buildUsageMap(
        oldSnapshot.deprecated.map((item) => ({
            key: `item:${item.filePath}${item.nodeName}`,
            exports: item.usages.map((usage) => ({
                name: usage.name,
                files: usage.files,
            })),
        })),
    )

    const oldPackagesMap = buildUsageMap(
        oldSnapshot.deprecatedPackageUsages.map((pkg) => ({
            key: `package:${pkg.packageName}`,
            exports: pkg.usages,
        })),
    )

    const deprecatedIncreases = compareUsages(
        oldDeprecatedMap,
        newSnapshot.deprecated.map((item) => ({
            key: `item:${item.filePath}${item.nodeName}`,
            exports: item.usages.map((usage) => ({
                name: usage.name,
                files: usage.files,
            })),
        })),
    )

    const packageIncreases = compareUsages(
        oldPackagesMap,
        newSnapshot.deprecatedPackageUsages.map((pkg) => ({
            key: `package:${pkg.packageName}`,
            exports: pkg.usages,
        })),
    )

    return [...deprecatedIncreases, ...packageIncreases]
}

async function main() {
    if (!fs.existsSync(SNAPSHOT_PATH)) {
        console.log('No snapshot found, creating new one')
        await execute(config)
        process.exit(0)
    }

    const currentSnapshot = JSON.parse(
        fs.readFileSync(SNAPSHOT_PATH, 'utf8'),
    ) as StaticAnalysisReport

    console.log(
        `Current snapshot: ${currentSnapshot.total} total deprecated usages (generated at ${currentSnapshot.date})`,
    )
    console.log(`  - Deprecated items: ${currentSnapshot.deprecated.length}`)
    console.log(
        `  - Deprecated packages: ${currentSnapshot.deprecatedPackageUsages.length}`,
    )

    await execute(config)

    const updatedSnapshot = JSON.parse(
        fs.readFileSync(SNAPSHOT_PATH, 'utf8'),
    ) as StaticAnalysisReport

    console.log(
        `\nUpdated snapshot: ${updatedSnapshot.total} total deprecated usages (generated at ${updatedSnapshot.date})`,
    )
    console.log(`  - Deprecated items: ${updatedSnapshot.deprecated.length}`)
    console.log(
        `  - Deprecated packages: ${updatedSnapshot.deprecatedPackageUsages.length}`,
    )

    const increasedUsages = compareSnapshots(currentSnapshot, updatedSnapshot)

    if (increasedUsages.length > 0) {
        console.log('\n⚠️  New deprecated usages found!\n')

        const actualIncreases = increasedUsages.filter(
            (item) => item.newCount > item.oldCount,
        )

        if (actualIncreases.length === 0) {
            console.log(
                'False alarm - all changes are file path variations, not actual increases',
            )
            console.log('\n✅ No net increase in deprecated usages')
            process.exit(0)
        }

        console.table(
            actualIncreases.map((item) => ({
                File: item.filePath,
                Export: item.exportName,
                'Old Count': item.oldCount,
                'New Count': item.newCount,
                Increase: item.newCount - item.oldCount,
            })),
        )

        console.log('\nNew usage locations:')
        for (const item of actualIncreases) {
            console.log(
                `\n${item.filePath} - ${item.exportName} (${item.newUsages.length} new):`,
            )
            for (const usage of item.newUsages) {
                console.log(`  - ${usage}`)
            }
        }

        process.exit(1)
    } else {
        const totalDiff = updatedSnapshot.total - currentSnapshot.total
        if (totalDiff < 0) {
            console.log(
                `\n✅ Good job! Deprecated usages decreased by ${Math.abs(totalDiff)}`,
            )
        } else if (totalDiff === 0) {
            console.log('\n✅ No changes in deprecated usages')
        }
        process.exit(0)
    }
}

main().catch(console.error)
