import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const activeProcesses: Set<ReturnType<typeof spawn>> = new Set()

function cleanup() {
    for (const proc of activeProcesses) {
        try {
            proc.kill('SIGKILL')
        } catch {
            // Process may already be dead
        }
    }
    activeProcesses.clear()
}

process.on('SIGINT', () => {
    console.log('\nInterrupted, cleaning up...')
    cleanup()
    process.exit(130)
})

process.on('SIGTERM', () => {
    cleanup()
    process.exit(143)
})

process.on('exit', () => {
    cleanup()
})

type Framework = 'vitest' | 'jest'

type TestResult = {
    file: string
    tests: number
    heapMB: number
}

type FileStats = {
    file: string
    tests: number
    runs: number[]
    avg: number
    min: number
    max: number
    stdDev: number
}

type Args = {
    runs: number
    path: string
    framework: Framework | 'auto'
    filter: string | null
}

function parseArgs(): Args {
    const args = process.argv.slice(2)
    const result: Args = {
        runs: 5,
        path: '.',
        framework: 'auto',
        filter: null,
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        const nextArg = args[i + 1]

        if (arg === '--runs' && nextArg) {
            result.runs = parseInt(nextArg, 10)
            i++
        } else if (arg === '--path' && nextArg) {
            result.path = nextArg
            i++
        } else if (arg === '--framework' && nextArg) {
            if (nextArg === 'vitest' || nextArg === 'jest') {
                result.framework = nextArg
            }
            i++
        } else if (arg === '--filter' && nextArg) {
            result.filter = nextArg
            i++
        } else if (arg === '--help' || arg === '-h') {
            console.log(`
Test Memory Analysis Script
===========================

Analyzes heap memory usage across multiple test runs.

Usage:
  pnpm test:memory-analysis [options]

Options:
  --runs <n>        Number of test runs (default: 5)
  --path <dir>      Path to package/project (default: .)
  --framework <fw>  Force framework: 'vitest' or 'jest' (default: auto-detect)
  --filter <pat>    Filter test files pattern
  --help, -h        Show this help message

Examples:
  pnpm test:memory-analysis --path packages/tickets --runs 5
  pnpm test:memory-analysis --path packages/tickets --filter "useInfinite"
`)
            process.exit(0)
        }
    }

    return result
}

function detectFramework(targetPath: string): Framework {
    const vitestConfigs = [
        'vitest.config.ts',
        'vitest.config.js',
        'vitest.config.mts',
        'vitest.config.mjs',
    ]

    const jestConfigs = ['jest.config.ts', 'jest.config.js', 'jest.config.mjs']

    for (const config of vitestConfigs) {
        if (fs.existsSync(path.join(targetPath, config))) {
            return 'vitest'
        }
    }

    const viteConfig = path.join(targetPath, 'vite.config.ts')
    if (fs.existsSync(viteConfig)) {
        const content = fs.readFileSync(viteConfig, 'utf-8')
        if (content.includes('test:') || content.includes('test :')) {
            return 'vitest'
        }
    }

    for (const config of jestConfigs) {
        if (fs.existsSync(path.join(targetPath, config))) {
            return 'jest'
        }
    }

    const packageJson = path.join(targetPath, 'package.json')
    if (fs.existsSync(packageJson)) {
        const content = JSON.parse(fs.readFileSync(packageJson, 'utf-8'))
        if (content.jest) {
            return 'jest'
        }
    }

    throw new Error(
        `Could not detect test framework in ${targetPath}. Use --framework to specify.`,
    )
}

function buildTestCommand(
    framework: Framework,
    targetPath: string,
    filter: string | null,
): string {
    const isMonorepoRoot = targetPath === '.' || targetPath === process.cwd()

    if (framework === 'vitest') {
        let cmd = 'pnpm vitest run --configLoader=runner --logHeapUsage'
        if (filter) {
            cmd += ` ${filter}`
        }
        if (!isMonorepoRoot) {
            cmd = `cd "${targetPath}" && ${cmd}`
        }
        return cmd
    } else {
        let cmd = 'pnpm jest --logHeapUsage'
        if (filter) {
            cmd += ` ${filter}`
        }
        if (!isMonorepoRoot) {
            cmd = `cd "${targetPath}" && ${cmd}`
        }
        return cmd
    }
}

const TEST_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes per run

function runTests(
    command: string,
    runNumber: number,
    totalRuns: number,
): Promise<{ output: string; success: boolean }> {
    return new Promise((resolve) => {
        console.log(`\nRun ${runNumber}/${totalRuns}...`)

        let output = ''
        let resolved = false

        const proc = spawn(command, {
            shell: true,
            stdio: ['ignore', 'pipe', 'pipe'],
        })

        activeProcesses.add(proc)

        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true
                console.log(`  Run ${runNumber} timed out after ${TEST_TIMEOUT_MS / 1000}s, killing...`)
                proc.kill('SIGKILL')
                activeProcesses.delete(proc)
                resolve({ output, success: false })
            }
        }, TEST_TIMEOUT_MS)

        proc.stdout?.on('data', (data) => {
            output += data.toString()
        })

        proc.stderr?.on('data', (data) => {
            output += data.toString()
        })

        proc.on('close', (code) => {
            if (!resolved) {
                resolved = true
                clearTimeout(timeout)
                activeProcesses.delete(proc)

                const success = code === 0
                if (!success) {
                    console.log(`  Run ${runNumber} had test failures (will use heap data if available)`)
                } else {
                    console.log(`  Run ${runNumber} completed successfully`)
                }

                resolve({ output, success })
            }
        })

        proc.on('error', (err) => {
            if (!resolved) {
                resolved = true
                clearTimeout(timeout)
                activeProcesses.delete(proc)
                console.log(`  Run ${runNumber} failed to execute: ${err.message}`)
                resolve({ output: '', success: false })
            }
        })
    })
}

function parseHeapOutput(output: string, framework: Framework): TestResult[] {
    const results: TestResult[] = []
    const lines = output.split('\n')

    if (framework === 'vitest') {
        // Vitest: single-line format with test count
        // Format: " ✓ src/path/file.spec.tsx (9 tests) 1375ms 76 MB heap used"
        for (const line of lines) {
            const match = line.match(
                /^\s*[✓✗]\s+(.+?\.(?:spec|test)\.(?:tsx?|jsx?|mjs))\s+\((\d+)\s+tests?\)\s+\d+ms\s+(\d+)\s*MB\s*heap/,
            )
            if (match) {
                results.push({
                    file: path.basename(match[1]),
                    tests: parseInt(match[2], 10),
                    heapMB: parseFloat(match[3]),
                })
            }
        }
    } else {
        // Jest: file info and test counts on separate lines
        // Format: "PASS src/path/file.spec.tsx (323 MB heap size)"
        // followed by test result lines: "  ✓ test name (34 ms)"
        let currentFile: { file: string; heapMB: number } | null = null
        let testCount = 0

        for (const line of lines) {
            // Match PASS/FAIL line with heap info
            const fileMatch = line.match(
                /(?:PASS|FAIL)\s+(.+?\.(?:spec|test)\.(?:tsx?|jsx?|mjs))\s+\((\d+)\s*MB\s*heap/i,
            )

            if (fileMatch) {
                // Save previous file results if exists
                if (currentFile) {
                    results.push({
                        file: currentFile.file,
                        tests: testCount,
                        heapMB: currentFile.heapMB,
                    })
                }
                // Start tracking new file
                currentFile = {
                    file: path.basename(fileMatch[1]),
                    heapMB: parseFloat(fileMatch[2]),
                }
                testCount = 0
            } else if (currentFile && /^\s+[✓✗]/.test(line)) {
                // Count individual test results
                testCount++
            }
        }

        // Don't forget the last file
        if (currentFile) {
            results.push({
                file: currentFile.file,
                tests: testCount,
                heapMB: currentFile.heapMB,
            })
        }
    }

    return results
}

function calculateStats(allRuns: TestResult[][]): FileStats[] {
    const fileMap = new Map<string, { tests: number; runs: number[] }>()

    for (const run of allRuns) {
        for (const result of run) {
            const existing = fileMap.get(result.file)
            if (existing) {
                existing.runs.push(result.heapMB)
                if (result.tests > 0) {
                    existing.tests = result.tests
                }
            } else {
                fileMap.set(result.file, {
                    tests: result.tests,
                    runs: [result.heapMB],
                })
            }
        }
    }

    const stats: FileStats[] = []

    for (const [file, data] of fileMap) {
        const runs = data.runs
        const avg = runs.reduce((a, b) => a + b, 0) / runs.length
        const min = Math.min(...runs)
        const max = Math.max(...runs)

        const squaredDiffs = runs.map((val) => Math.pow(val - avg, 2))
        const avgSquaredDiff =
            squaredDiffs.reduce((a, b) => a + b, 0) / runs.length
        const stdDev = Math.sqrt(avgSquaredDiff)

        stats.push({
            file,
            tests: data.tests,
            runs,
            avg,
            min,
            max,
            stdDev,
        })
    }

    return stats.sort((a, b) => b.avg - a.avg)
}

function formatTable(stats: FileStats[], framework: Framework, totalRuns: number, successfulRuns: number): void {
    console.log('\n')
    console.log('Test Memory Analysis Report')
    console.log('===========================')
    console.log(`Runs: ${successfulRuns}/${totalRuns} successful | Framework: ${framework}`)
    console.log('')

    if (stats.length === 0) {
        console.log('No heap data found. Make sure tests are running with heap logging enabled.')
        return
    }

    const maxFileLen = Math.max(
        4,
        ...stats.map((s) => s.file.length),
        'File'.length,
    )

    const header = [
        'File'.padEnd(maxFileLen),
        'Tests'.padStart(5),
        'Avg (MB)'.padStart(10),
        'Min'.padStart(7),
        'Max'.padStart(7),
        'Std Dev'.padStart(9),
    ].join(' | ')

    const separator = [
        '-'.repeat(maxFileLen),
        '-'.repeat(5),
        '-'.repeat(10),
        '-'.repeat(7),
        '-'.repeat(7),
        '-'.repeat(9),
    ].join('-+-')

    console.log(header)
    console.log(separator)

    for (const stat of stats) {
        const row = [
            stat.file.padEnd(maxFileLen),
            stat.tests.toString().padStart(5),
            stat.avg.toFixed(2).padStart(10),
            stat.min.toFixed(0).padStart(7),
            stat.max.toFixed(0).padStart(7),
            stat.stdDev.toFixed(2).padStart(9),
        ].join(' | ')
        console.log(row)
    }

    console.log('')

    const totalHeap = stats.reduce((sum, s) => sum + s.avg, 0)
    const avgHeap = totalHeap / stats.length
    const totalTests = stats.reduce((sum, s) => sum + s.tests, 0)
    console.log(`Total: ${stats.length} files, ${totalTests} tests, ${avgHeap.toFixed(0)} MB avg heap per file`)

    const topConsumers = stats.slice(0, 5)
    if (topConsumers.length > 0) {
        console.log('')
        console.log('Top 5 memory consumers:')
        topConsumers.forEach((s, i) => {
            console.log(`  ${i + 1}. ${s.file}: ${s.avg.toFixed(0)} MB (${s.tests} tests)`)
        })
    }
}

async function main() {
    const args = parseArgs()

    const targetPath = path.resolve(args.path)

    if (!fs.existsSync(targetPath)) {
        console.error(`Error: Path does not exist: ${targetPath}`)
        process.exit(1)
    }

    console.log('Test Memory Analysis')
    console.log('====================')
    console.log(`Target: ${targetPath}`)
    console.log(`Runs: ${args.runs}`)

    let framework: Framework
    if (args.framework === 'auto') {
        framework = detectFramework(targetPath)
        console.log(`Framework: ${framework} (auto-detected)`)
    } else {
        framework = args.framework
        console.log(`Framework: ${framework} (specified)`)
    }

    if (args.filter) {
        console.log(`Filter: ${args.filter}`)
    }

    const command = buildTestCommand(framework, targetPath, args.filter)
    console.log(`Command: ${command}`)

    const allRuns: TestResult[][] = []
    let successfulRuns = 0

    for (let i = 1; i <= args.runs; i++) {
        const { output } = await runTests(command, i, args.runs)

        const results = parseHeapOutput(output, framework)

        if (results.length > 0) {
            allRuns.push(results)
            successfulRuns++
        }
    }

    cleanup()

    if (allRuns.length === 0) {
        console.error('\nError: No heap data collected from any run.')
        console.error('Make sure:')
        console.error('  1. Tests exist in the target path')
        console.error('  2. The test framework supports --logHeapUsage')
        console.error('  3. Tests are completing (even with failures)')
        process.exit(1)
    }

    const stats = calculateStats(allRuns)
    formatTable(stats, framework, args.runs, successfulRuns)
}

main().catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
})
