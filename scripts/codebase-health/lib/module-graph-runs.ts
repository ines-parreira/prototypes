import path from 'node:path'

import baseConfig from '../../../sa.config'
import { ROOT_DIR } from './report.utils'
import type { ModuleGraphOptions } from './types'

export type ModuleGraphRun = {
    name: string
    options: ModuleGraphOptions
}

if (!baseConfig.moduleGraphOptions) {
    throw new Error('sa.config.ts is missing moduleGraphOptions')
}

export const moduleGraphRuns: ModuleGraphRun[] = [
    {
        name: 'app',
        options: baseConfig.moduleGraphOptions,
    },
    {
        name: 'packages',
        options: {
            rootDir: path.resolve(ROOT_DIR, 'packages'),
            modules: ['node_modules'],
        },
    },
]
