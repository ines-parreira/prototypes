#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const token = getRulesyncToken()

if (!token) {
    console.error(
        [
            'Missing GitHub token for Rulesync private repositories.',
            '',
            'Set RULESYNC_GITHUB_TOKEN, GH_TOKEN, or GITHUB_TOKEN.',
            'For local development, authenticate GitHub CLI with `gh auth login`.',
        ].join('\n'),
    )
    process.exit(1)
}

runRulesync(['install', '--update', '--token', token])
runRulesync(['generate'])

function getRulesyncToken() {
    const envToken =
        process.env.RULESYNC_GITHUB_TOKEN ??
        process.env.GH_TOKEN ??
        process.env.GITHUB_TOKEN

    if (envToken) {
        return envToken
    }

    if (process.env.CI) {
        return undefined
    }

    const result = spawnSync('gh', ['auth', 'token'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
    })

    if (result.status !== 0) {
        return undefined
    }

    return result.stdout.trim() || undefined
}

function runRulesync(args) {
    const result = spawnSync('rulesync', args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    })

    if (result.error) {
        console.error(result.error.message)
        process.exit(1)
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1)
    }
}
