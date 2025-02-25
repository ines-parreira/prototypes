import fs from 'node:fs'
import path from 'node:path'

const topLevelDir = import.meta.dirname ?? process.cwd()
const srcDir = path.join(topLevelDir, 'src')

const topLevelModules = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.includes('.'))
    .map((entry) => entry.name)
    .join('|')

export default {
    semi: false,
    quoteProps: 'as-needed',
    singleQuote: true,
    arrowParens: 'always',
    trailingComma: 'all',
    bracketSpacing: true,
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrder: [
        '^react$', // react
        '^node:.+', // node stdlib
        '<THIRD_PARTY_MODULES>', // external modules (npm packages)
        '^@gorgias', // @gorgias modules
        `^(${topLevelModules})`, // absolute modules
        '^[./]((?!less).)*$', // relative imports
        '.(css|less)$', // styles
    ],
    importOrderSeparation: true,
    importOrderSideEffects: false,
    importOrderSortSpecifiers: true,
    importOrderCaseInsensitive: true,
}
