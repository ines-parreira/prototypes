import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const PACKAGE_NAME_PATTERN = /^[a-z][a-z0-9-]*$/

type PackageJson = {
    name: string
    version: string
    description: string
    private: boolean
    sideEffects: boolean
    type: 'module'
    exports: Record<string, string>
    imports: Record<string, string[]>
    scripts: Record<string, string>
    peerDependencies: Record<string, string>
    devDependencies: Record<string, string>
}

function printUsage() {
    console.log(`
Generate Monorepo Package
=========================

Usage:
  pnpm exec tsx scripts/codegen/generate-package.ts <name>

Arguments:
  name  Lowercase package folder name, using dashes when needed.
`)
}

function parsePackageName(): string {
    const args = process.argv.slice(2)

    if (args.includes('--help') || args.includes('-h')) {
        printUsage()
        process.exit(0)
    }

    if (args.length !== 1) {
        throw new Error('Expected exactly one package name argument.')
    }

    const packageName = args[0]

    if (!PACKAGE_NAME_PATTERN.test(packageName)) {
        throw new Error(
            'Package name must start with a lowercase letter and contain only lowercase letters, numbers, and dashes.',
        )
    }

    return packageName
}

function toExportedConstantName(packageName: string): string {
    return packageName.replace(/-([a-z0-9])/g, (_, character: string) =>
        character.toUpperCase(),
    )
}

function buildPackageJson(packageName: string): PackageJson {
    return {
        name: `@repo/${packageName}`,
        version: '1.0.0',
        description: `Helpdesk monorepo package ${packageName}`,
        private: true,
        sideEffects: false,
        type: 'module',
        exports: {
            '.': './src/index.ts',
        },
        imports: {
            '#*': [
                './src/*',
                './src/*.ts',
                './src/*.tsx',
                './src/*/index.ts',
                './src/*/index.tsx',
            ],
        },
        scripts: {
            'format:check': 'oxfmt --check .',
            'format:fix': 'oxfmt --write .',
            lint: 'oxlint --quiet',
            test: 'vitest run --configLoader=runner',
            'test:ci:cover':
                'NODE_OPTIONS="--max-old-space-size=4096" vitest run --maxWorkers=2 --configLoader=runner --coverage --silent=true',
            'test:watch': 'vitest watch --configLoader=runner',
            typecheck: 'tsgo -p ./tsconfig.json --noEmit true',
        },
        peerDependencies: {
            react: 'catalog:react',
        },
        devDependencies: {
            '@repo/config': 'workspace:*',
            '@testing-library/dom': 'catalog:test',
            '@testing-library/jest-dom': 'catalog:test',
            '@testing-library/react': 'catalog:test',
            '@testing-library/user-event': 'catalog:test',
            '@types/react': 'catalog:react',
            '@vitest/coverage-v8': 'catalog:test',
            oxfmt: 'catalog:formatter',
            oxlint: 'catalog:oxlint',
            typescript: 'catalog:typescript',
            vitest: 'catalog:test',
        },
    }
}

function buildTsconfig() {
    return {
        extends: '@repo/config/tsconfig.react.json',
        compilerOptions: {
            types: ['vitest/globals'],
        },
        include: ['src/**/*', 'vitest.config.ts'],
        exclude: ['node_modules'],
    }
}

function buildOxlintConfig() {
    return {
        extends: ['./node_modules/@repo/config/oxlintrc.json'],
    }
}

function buildVitestConfig(): string {
    return `import { createConfig } from '@repo/config/vitest'

export default createConfig({
    test: {
        passWithNoTests: true,
        coverage: {
            exclude: ['vitest.config.ts', 'src/index.ts'],
        },
    },
})
`
}

function buildIndex(packageName: string): string {
    const constantName = toExportedConstantName(packageName)

    return `export const ${constantName} = \`New package ${packageName} created\`
`
}

function writeJsonFile(filePath: string, value: unknown) {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`, {
        flag: 'wx',
    })
}

function writeTextFile(filePath: string, value: string) {
    fs.writeFileSync(filePath, value, { flag: 'wx' })
}

function installWorkspaceDependencies(repoRoot: string) {
    console.log('Running pnpm install')

    execFileSync('pnpm', ['install'], {
        cwd: repoRoot,
        stdio: 'inherit',
    })
}

function formatGeneratedPackage(repoRoot: string, packageName: string) {
    console.log(`Running @repo/${packageName} format:fix`)

    execFileSync('pnpm', ['--filter', `@repo/${packageName}`, 'format:fix'], {
        cwd: repoRoot,
        stdio: 'inherit',
    })
}

function generatePackage(packageName: string) {
    const repoRoot = path.resolve(__dirname, '../..')
    const packageRoot = path.join(repoRoot, 'packages', packageName)
    const sourceRoot = path.join(packageRoot, 'src')

    if (fs.existsSync(packageRoot)) {
        throw new Error(`Package already exists: packages/${packageName}`)
    }

    fs.mkdirSync(sourceRoot, { recursive: true })

    writeJsonFile(
        path.join(packageRoot, 'package.json'),
        buildPackageJson(packageName),
    )
    writeJsonFile(path.join(packageRoot, 'tsconfig.json'), buildTsconfig())
    writeJsonFile(path.join(packageRoot, '.oxlintrc.json'), buildOxlintConfig())
    writeTextFile(
        path.join(packageRoot, 'vitest.config.ts'),
        buildVitestConfig(),
    )
    writeTextFile(path.join(sourceRoot, 'index.ts'), buildIndex(packageName))

    installWorkspaceDependencies(repoRoot)
    formatGeneratedPackage(repoRoot, packageName)

    console.log(
        `Package @repo/${packageName} was successfully created in packages/${packageName}`,
    )
}

function main() {
    try {
        generatePackage(parsePackageName())
    } catch (error) {
        console.error(error instanceof Error ? error.message : error)
        process.exitCode = 1
    }
}

main()
