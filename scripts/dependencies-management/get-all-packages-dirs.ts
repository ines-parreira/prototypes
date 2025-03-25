import fs from 'fs'
import path from 'path'

export function getAllPackageDirs(dir: string): string[] {
    let results: string[] = []

    try {
        const entries = fs
            .readdirSync(dir)
            .filter((entry) => !entry.startsWith('.'))

        for (const entry of entries) {
            const fullPath = path.join(dir, entry)

            if (fs.existsSync(path.join(fullPath, 'package.json'))) {
                results.push(fullPath)
            }

            // Handle scoped packages (@organization/package-name)
            if (entry.startsWith('@') && fs.statSync(fullPath).isDirectory()) {
                const scopedEntries = fs.readdirSync(fullPath)
                for (const scopedEntry of scopedEntries) {
                    const scopedFullPath = path.join(fullPath, scopedEntry)
                    if (
                        fs.existsSync(path.join(scopedFullPath, 'package.json'))
                    ) {
                        results.push(scopedFullPath)
                    }

                    // Check if the scoped package has node_modules
                    const nestedNodeModules = path.join(
                        scopedFullPath,
                        'node_modules',
                    )
                    if (
                        fs.existsSync(nestedNodeModules) &&
                        fs.statSync(nestedNodeModules).isDirectory()
                    ) {
                        results = results.concat(
                            getAllPackageDirs(nestedNodeModules),
                        )
                    }
                }
            }

            // Look for nested node_modules
            const nestedNodeModules = path.join(fullPath, 'node_modules')
            if (
                fs.existsSync(nestedNodeModules) &&
                fs.statSync(nestedNodeModules).isDirectory()
            ) {
                results = results.concat(getAllPackageDirs(nestedNodeModules))
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error)
    }

    return results
}
