import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

type Args = {
    base: string
    head: string
    excludes: string[]
    maxBuckets: number
}

type NxProject = {
    root: string
}

type WeightedProject = {
    name: string
    weight: number
}

type Bucket = {
    bucket: number
    projects: string[]
    localParallel: number
    totalWeight: number
}

type BucketOutput = {
    bucket: number
    projects: string[]
    localParallel: number
}

type Output = {
    bucketCount: number
    buckets: BucketOutput[]
}

const IGNORED_DIRECTORIES = new Set([
    '.git',
    '.nx',
    'build',
    'coverage',
    'dist',
    'node_modules',
])
const MAX_BUCKET_LOCAL_PARALLEL = 2

function parseArgs(): Args {
    const args = process.argv.slice(2)
    const result: Args = {
        base: '',
        head: 'HEAD',
        excludes: [],
        maxBuckets: 6,
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        const nextArg = args[i + 1]

        if (arg === '--base' && nextArg) {
            result.base = nextArg
            i++
        } else if (arg === '--head' && nextArg) {
            result.head = nextArg
            i++
        } else if (arg === '--exclude' && nextArg) {
            result.excludes.push(
                ...nextArg
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean),
            )
            i++
        } else if (arg === '--max-buckets' && nextArg) {
            result.maxBuckets = parseInt(nextArg, 10)
            i++
        } else if (arg === '--help' || arg === '-h') {
            console.log(`
Build Packages Test Buckets
===========================

Builds weighted Nx affected buckets for non-helpdesk package tests.

Usage:
  tsx scripts/ci/build-packages-test-buckets.ts --base <sha> [options]

Options:
  --base <sha>         Base commit for Nx affected
  --head <sha>         Head commit for Nx affected (default: HEAD)
  --exclude <project>  Comma-separated list of projects to exclude
  --max-buckets <n>    Maximum number of buckets to generate (default: 6)
  --help, -h           Show this help message
`)
            process.exit(0)
        }
    }

    if (!result.base) {
        throw new Error('Missing required argument: --base')
    }

    if (Number.isNaN(result.maxBuckets) || result.maxBuckets < 1) {
        throw new Error('--max-buckets must be a positive integer')
    }

    return result
}

function runNxJson<T>(args: string[]): T {
    const output = execFileSync('npx', ['nx', ...args], {
        encoding: 'utf8',
        env: {
            ...process.env,
            NX_DAEMON: 'false',
        },
    })

    return JSON.parse(output) as T
}

function getAffectedProjects(args: Args): string[] {
    const nxArgs = [
        'show',
        'projects',
        '--affected',
        '--with-target=test:ci:cover',
        '--json',
        `--base=${args.base}`,
        `--head=${args.head}`,
    ]

    if (args.excludes.length > 0) {
        nxArgs.push(`--exclude=${args.excludes.join(',')}`)
    }

    return runNxJson<string[]>(nxArgs)
}

function getProjectRoot(projectName: string): string {
    const project = runNxJson<NxProject>([
        'show',
        'project',
        projectName,
        '--json',
    ])

    if (!project.root) {
        throw new Error(`Could not resolve Nx root for project: ${projectName}`)
    }

    return project.root
}

function countTestFiles(projectRoot: string): number {
    const rootPath = path.resolve(projectRoot)

    if (!fs.existsSync(rootPath)) {
        return 1
    }

    let count = 0
    const queue = [rootPath]

    while (queue.length > 0) {
        const currentPath = queue.pop()

        if (!currentPath) {
            continue
        }

        for (const entry of fs.readdirSync(currentPath, {
            withFileTypes: true,
        })) {
            const entryPath = path.join(currentPath, entry.name)

            if (entry.isDirectory()) {
                if (!IGNORED_DIRECTORIES.has(entry.name)) {
                    queue.push(entryPath)
                }

                continue
            }

            if (/(spec|test)\.(ts|tsx|js|jsx)$/.test(entry.name)) {
                count++
            }
        }
    }

    return Math.max(count, 1)
}

function resolveBucketCount(projectCount: number, maxBuckets: number): number {
    let desiredBucketCount = 0

    if (projectCount === 0) {
        desiredBucketCount = 0
    } else if (projectCount <= 4) {
        desiredBucketCount = 1
    } else if (projectCount <= 8) {
        desiredBucketCount = 2
    } else if (projectCount <= 16) {
        desiredBucketCount = 4
    } else {
        desiredBucketCount = 6
    }

    return Math.min(desiredBucketCount, maxBuckets)
}

function buildBuckets(
    projects: WeightedProject[],
    bucketCount: number,
): BucketOutput[] {
    if (bucketCount === 0) {
        return []
    }

    const buckets: Bucket[] = Array.from(
        { length: bucketCount },
        (_, index) => ({
            bucket: index + 1,
            projects: [],
            localParallel: 1,
            totalWeight: 0,
        }),
    )

    for (const project of projects) {
        const lightestBucket = buckets.reduce((currentLightest, bucket) => {
            if (bucket.totalWeight < currentLightest.totalWeight) {
                return bucket
            }

            if (
                bucket.totalWeight === currentLightest.totalWeight &&
                bucket.projects.length < currentLightest.projects.length
            ) {
                return bucket
            }

            return currentLightest
        }, buckets[0])

        lightestBucket.projects.push(project.name)
        lightestBucket.totalWeight += project.weight
    }

    return buckets.map((bucket) => ({
        bucket: bucket.bucket,
        projects: bucket.projects,
        localParallel: Math.max(
            1,
            Math.min(MAX_BUCKET_LOCAL_PARALLEL, bucket.projects.length),
        ),
    }))
}

function main() {
    const args = parseArgs()
    const affectedProjects = getAffectedProjects(args)
    const bucketCount = resolveBucketCount(
        affectedProjects.length,
        args.maxBuckets,
    )

    if (bucketCount === 0) {
        const output: Output = {
            bucketCount: 0,
            buckets: [],
        }

        console.log(JSON.stringify(output))
        return
    }

    const weightedProjects = affectedProjects
        .map((projectName) => {
            const projectRoot = getProjectRoot(projectName)

            return {
                name: projectName,
                weight: countTestFiles(projectRoot),
            }
        })
        .sort((left, right) => {
            if (left.weight !== right.weight) {
                return right.weight - left.weight
            }

            return left.name.localeCompare(right.name)
        })

    const output: Output = {
        bucketCount,
        buckets: buildBuckets(weightedProjects, bucketCount),
    }

    console.log(JSON.stringify(output))
}

main()
