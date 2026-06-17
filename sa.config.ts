import fs from 'node:fs'
import path from 'node:path'

import { defineConfig, deprecationPlugin } from '@gorgias/static-analysis'

import { deprecatedPackages } from './scripts/codebase-health/lib/deprecated-packages'

export default defineConfig({
    moduleGraphOptions: {
        rootDir: path.resolve(__dirname, 'apps/helpdesk/src'),
        modules: ['node_modules', 'node_modules/@types'],
        alias: {
            '@knocklabs/types': [
                path.resolve(
                    __dirname,
                    'apps/helpdesk/node_modules/@knocklabs/types/src/index.d.ts',
                ),
            ],
        },
        tsconfig: {
            configFile: path.resolve(__dirname, 'apps/helpdesk/tsconfig.json'),
        },
    },
    plugins: [
        deprecationPlugin({
            report: (results) => {
                fs.writeFileSync(
                    'scripts/deprecated-monitoring/deprecated.snapshot.json',
                    JSON.stringify(results, null, 2),
                )
            },
            deprecatedPackages,
        }),
    ],
})
