import { execSync } from 'child_process'
import deepmerge from 'deepmerge'
import fs from 'fs'
import path from 'path'

// @ts-ignore These configs are not typed
import gorgiasBaseConfig from '@gorgias/config/eslint-base'
// @ts-ignore These configs are not typed
import gorgiasConfigReact from '@gorgias/config/eslint-react'

/**
 * This config is the translation of the current .eslintrc.js config to the oxlint config
 */
import oxlintBaseConfig from './oxlint.base.json'

/**
 * This file is the bridge between our current shared eslint config and the oxlint config
 * format which only supports the .json format for now @see https://oxc.rs/docs/guide/usage/linter/config.html#oxlint-configuration-file
 * It outputs a .oxlintrc.json file which can be used by oxlint.
 * To add new rules (or override existing ones in the shared eslint configs), add them to the oxlint.base.json file.
 * Then run the oxlint:bridge script to update the .oxlintrc.json file.
 *
 * This bridge script is run automatically by the postinstall script.
 * This setup should be temporary until Oxlint supports a more flexible config format.
 */

/**
 * Configuration - Add any other keys that should be ignored
 * Oxlint config is aligned with Eslint v8 configuration schema with
 * a few small differences:
 * @see https://oxc.rs/docs/guide/usage/linter/config.html
 */
const IGNORE_KEYS = [
    // Oxlint doesn't support the extends key
    // when using a plugin, it automatically uses the "recommended" ruleset
    'extends',
    // Oxlint plugin naming is slightly different than Eslint, so we need to specify them
    // in the oxlint.base.json file
    'plugins',
    // TDLR: We don't need the parser & parserOptions keys because oxlint handles it
    'parser',
    'parserOptions',
    // The current settings key is irrelevant for oxlint:
    // - The helpdesk eslint config settings are relevant to the parser & resolver
    // which are handled by Oxlint
    // - The @gorgias/config/eslint-react config settings:
    // @see https://github.com/gorgias/frontend/blob/main/packages/config/eslint-react.js#L22
    // is not supported by oxlint @see https://oxc.rs/docs/guide/usage/linter/config.html#settings-react
    // Evaluation shows no negative impact on the linting results
    'settings',
]

type LintConfig = {
    [key: string]: any
}

function sortObjectDeep<T extends object>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) {
        return obj
    }

    if (Array.isArray(obj)) {
        // Sort array elements: priority strings first, then other strings, then objects
        return obj.map(sortObjectDeep).sort((a, b) => {
            const aIsString = typeof a === 'string'
            const bIsString = typeof b === 'string'

            const priorityValues = ['allow', 'off', 'deny', 'error', 'warn']
            const aIsPriority = aIsString && priorityValues.includes(a)
            const bIsPriority = bIsString && priorityValues.includes(b)

            // If both are priority strings, sort them based on priorityValues order
            if (aIsPriority && bIsPriority) {
                return priorityValues.indexOf(a) - priorityValues.indexOf(b)
            }

            // Priority strings come before everything else
            if (aIsPriority) return -1
            if (bIsPriority) return 1

            // If both are strings sort alphabetically/by keys
            if (typeof a === 'string' && typeof b === 'string') {
                return a.localeCompare(b)
            }

            // If both are objects sort alphabetically by keys
            if (typeof a === 'object' && typeof b === 'object') {
                return JSON.stringify(a).localeCompare(JSON.stringify(b))
            }

            // Regular string values come before object values
            return aIsString ? -1 : 1
        }) as T
    }

    return Object.keys(obj)
        .sort((a, b) => a.localeCompare(b))
        .reduce<Record<string, any>>((result, key) => {
            result[key] = sortObjectDeep((obj as Record<string, any>)[key])
            return result
        }, {}) as T
}

function mergeConfigs(
    configs: LintConfig[],
    ignoreKeys: string[] = IGNORE_KEYS,
): LintConfig {
    const [baseConfigs, oxlintBaseConfig] = [
        configs.slice(0, -1),
        configs[configs.length - 1],
    ]

    const filteredConfigs = baseConfigs.map((config) => {
        const filtered = { ...config }
        ignoreKeys.forEach((key) => {
            delete filtered[key]
        })
        return filtered
    })

    const mergeArrays = (target: object[], source: object[]) => {
        return Array.from(new Set([...target, ...source])).sort()
    }

    const mergedConfig = deepmerge.all([...filteredConfigs, oxlintBaseConfig], {
        arrayMerge: mergeArrays,
    })

    return sortObjectDeep(mergedConfig)
}

const mergedConfig = mergeConfigs([
    gorgiasBaseConfig,
    gorgiasConfigReact,
    oxlintBaseConfig,
])

const outputPath = path.resolve(process.cwd(), 'apps/helpdesk/.oxlintrc.json')

// Write the initial merged config
fs.writeFileSync(outputPath, JSON.stringify(mergedConfig), 'utf8')

// Format using prettier
try {
    execSync(`prettier --write --experimental-cli ${outputPath}`, {
        stdio: 'inherit',
    })
    // eslint-disable-next-line no-console
    console.log(
        'ESLint configurations merged and formatted successfully to .oxlintrc.json!',
    )
} catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error formatting the output file:', error)
    process.exit(1)
}
