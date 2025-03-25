import fs from 'fs'
import path from 'path'
import semver from 'semver'

import { getAllPackageDirs } from './get-all-packages-dirs'

const nodeModulesPath = path.resolve(process.cwd(), 'node_modules')

type PackageInfo = {
    path: string
    name: string
    version: string
    engine: string
}
const incompatiblePackages: Omit<PackageInfo, 'path'>[] = []

const TARGET_VERSION = '22.0.0'
// Get all package directories and convert to package names
const packageDirs = getAllPackageDirs(nodeModulesPath)

for (const dir of packageDirs) {
    try {
        const pkgJson = JSON.parse(
            fs.readFileSync(path.join(dir, 'package.json'), 'utf8'),
        )

        if (!pkgJson.engines?.node) {
            continue
        }

        if (!semver.satisfies(TARGET_VERSION, pkgJson.engines.node)) {
            incompatiblePackages.push({
                name: pkgJson.name,
                version: pkgJson.version,
                engine: pkgJson.engines.node,
            })
        }
    } catch (error) {
        console.error(`Error reading package.json in ${dir}:`, error)
        continue
    }
}

// eslint-disable-next-line no-console
console.log('Potentially incompatible packages:')
// eslint-disable-next-line no-console
console.table(incompatiblePackages)
