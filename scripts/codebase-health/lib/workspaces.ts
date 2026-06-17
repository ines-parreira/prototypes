import fs from 'node:fs'
import path from 'node:path'

import { ROOT_DIR } from './report.utils'

export type WorkspaceProject = {
    name: string
    directory: string
}

export function listWorkspaceProjects(): WorkspaceProject[] {
    const projects: WorkspaceProject[] = []

    for (const baseDirectory of ['apps', 'packages']) {
        const absoluteBaseDirectory = path.join(ROOT_DIR, baseDirectory)
        const entries = fs.readdirSync(absoluteBaseDirectory, {
            withFileTypes: true,
        })

        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue
            }

            const directory = path.join(absoluteBaseDirectory, entry.name)
            const packageJsonPath = path.join(directory, 'package.json')

            if (!fs.existsSync(packageJsonPath)) {
                continue
            }

            const packageJson = JSON.parse(
                fs.readFileSync(packageJsonPath, 'utf8'),
            ) as { name?: string }

            projects.push({
                name: packageJson.name ?? entry.name,
                directory,
            })
        }
    }

    return projects.sort((left, right) =>
        left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    )
}
