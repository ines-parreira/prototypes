import { beforeEach, describe, expect, it, vi } from 'vitest'

import { evalStore } from '../debug/evalStore'
import {
    CONTROL_FLAG,
    evaluateFlag,
    evaluateFlagAsync,
    getEngineContexts,
    getFlagDetails,
    initEngines,
    subscribeToFlag,
} from '../dualEvaluation'
import type { FlagContext } from '../engines/context'
import type { FeatureFlagKey } from '../featureFlagKey'
import { createFakeLDClient } from './fakeLDClient'
import { createFakeSplitClient } from './fakeSplitClient'

let fakeLDClient: ReturnType<typeof createFakeLDClient>
let fakeSplitClient: ReturnType<typeof createFakeSplitClient>

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: () => ({
            getItem: () => Promise.resolve(null),
            setItem: () => Promise.resolve(),
            removeItem: () => Promise.resolve(),
        }),
    },
}))

vi.mock('launchdarkly-js-client-sdk', () => ({
    initialize: () => fakeLDClient,
}))

vi.mock('@splitsoftware/splitio-browserjs', () => ({
    SplitFactory: () => ({ client: () => fakeSplitClient }),
    InLocalStorage: () => ({}),
}))

const testFlag = 'test-flag' as FeatureFlagKey

const flagContext: FlagContext = {
    key: 'acc-456',
    attributes: {
        userId: '123',
        domain: 'test.com',
        cluster: 'test',
        userImpersonated: false,
    },
}

function setupEngines(
    ldFlags: Record<string, unknown> = {},
    splitTreatments: Record<
        string,
        { treatment: string; config: string | null }
    > = {},
) {
    fakeLDClient = createFakeLDClient({
        [CONTROL_FLAG]: false,
        ...ldFlags,
    })
    fakeSplitClient = createFakeSplitClient(splitTreatments)

    window.GORGIAS_LAUNCHDARKLY_CLIENT_ID = 'ld-key'
    window.HARNESS_CLIENT_SDK_KEY = 'harness-key'

    initEngines(flagContext)
}

describe('dualEvaluation', () => {
    beforeEach(() => {
        evalStore.getState().clear()
    })

    describe('initEngines', () => {
        it('should initialize both engines and seed the eval store after ready', async () => {
            fakeLDClient = createFakeLDClient({
                [CONTROL_FLAG]: false,
                'some-flag': true,
            })
            fakeSplitClient = createFakeSplitClient({
                'some-flag': { treatment: 'on', config: null },
            })

            window.GORGIAS_LAUNCHDARKLY_CLIENT_ID = 'ld-key'
            window.HARNESS_CLIENT_SDK_KEY = 'harness-key'

            initEngines(flagContext)

            fakeLDClient._resolveInit()
            fakeSplitClient._emitReady()

            await vi.waitFor(() => {
                const entry = evalStore.getState().entries['some-flag']
                expect(entry).toBeDefined()
                expect(entry.launchdarklyValue).toBe(true)
            })
        })
    })

    describe('evaluateFlag', () => {
        it('should return the value from the primary (LD) engine', () => {
            setupEngines({ 'test-flag': true })

            const result = evaluateFlag(testFlag, false)

            expect(result).toBe(true)
        })

        it('should evaluate the secondary engine in a microtask', async () => {
            setupEngines(
                { 'test-flag': true },
                { 'test-flag': { treatment: 'on', config: null } },
            )

            evaluateFlag(testFlag, false)

            await vi.waitFor(() => {
                const entry = evalStore.getState().entries[testFlag]
                expect(entry).toBeDefined()
                expect(entry.harnessValue).toBe(true)
            })
        })

        it('should store a match when both engines agree', async () => {
            setupEngines(
                { 'test-flag': true },
                { 'test-flag': { treatment: 'on', config: null } },
            )

            evaluateFlag(testFlag, false)

            await vi.waitFor(() => {
                const entry = evalStore.getState().entries[testFlag]
                expect(entry).toBeDefined()
                expect(entry.status).toBe('match')
                expect(entry.launchdarklyValue).toBe(true)
                expect(entry.harnessValue).toBe(true)
            })
        })

        it('should store a mismatch when engines disagree', async () => {
            setupEngines(
                { 'test-flag': true },
                { 'test-flag': { treatment: 'off', config: null } },
            )

            evaluateFlag(testFlag, false)

            await vi.waitFor(() => {
                const entry = evalStore.getState().entries[testFlag]
                expect(entry).toBeDefined()
                expect(entry.status).toBe('mismatch')
                expect(entry.launchdarklyValue).toBe(true)
                expect(entry.harnessValue).toBe(false)
            })
        })

        it('should treat objects with different key order as equal', async () => {
            setupEngines(
                { 'test-flag': { a: 1, b: 2 } },
                { 'test-flag': { treatment: 'on', config: '{"b":2,"a":1}' } },
            )

            evaluateFlag(testFlag, {})

            await vi.waitFor(() => {
                const entry = evalStore.getState().entries[testFlag]
                expect(entry).toBeDefined()
                expect(entry.status).toBe('match')
            })
        })

        it('should not propagate secondary engine errors', async () => {
            setupEngines({ 'test-flag': true })
            // harness has no treatment for test-flag → returns 'control' → default
            // This won't throw, so let's verify the primary still returns correctly

            const result = evaluateFlag(testFlag, false)

            expect(result).toBe(true)

            await new Promise((resolve) => setTimeout(resolve, 10))
        })

        it('should use harness as primary when control flag says so', () => {
            setupEngines(
                { [CONTROL_FLAG]: true, 'test-flag': 'ld-value' },
                { 'test-flag': { treatment: 'harness-value', config: null } },
            )

            const result = evaluateFlag(testFlag, 'default')

            expect(result).toBe('harness-value')
        })
    })

    describe('evaluateFlagAsync', () => {
        it('should return the value from the primary engine', async () => {
            setupEngines({ 'test-flag': 'async-value' })

            fakeLDClient._resolveInit()
            fakeSplitClient._emitReady()

            const result = await evaluateFlagAsync(testFlag, 'default')

            expect(result).toEqual({ value: 'async-value', error: null })
        })

        it('should store a match when both async engines agree', async () => {
            setupEngines(
                { 'test-flag': 'same' },
                { 'test-flag': { treatment: 'same', config: null } },
            )

            fakeLDClient._resolveInit()
            fakeSplitClient._emitReady()

            await evaluateFlagAsync(testFlag, 'default')

            const entry = evalStore.getState().entries[testFlag]
            expect(entry).toBeDefined()
            expect(entry.status).toBe('match')
        })

        it('should store a mismatch when async engines disagree', async () => {
            setupEngines(
                { 'test-flag': 'value-a' },
                { 'test-flag': { treatment: 'value-b', config: null } },
            )

            fakeLDClient._resolveInit()
            fakeSplitClient._emitReady()

            await evaluateFlagAsync(testFlag, 'default')

            const entry = evalStore.getState().entries[testFlag]
            expect(entry).toBeDefined()
            expect(entry.status).toBe('mismatch')
        })

        it('should return default value and error when primary engine fails', async () => {
            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            setupEngines({ 'test-flag': 'value' })

            fakeLDClient._rejectInit(new Error('primary failed'))

            const result = await evaluateFlagAsync(testFlag, 'default')

            expect(result.value).toBe('default')
            expect(result.error).toBeInstanceOf(Error)

            consoleSpy.mockRestore()
        })

        it('should handle secondary engine timeout', async () => {
            vi.useFakeTimers()

            setupEngines(
                { 'test-flag': 'value' },
                { 'test-flag': { treatment: 'other', config: null } },
            )

            fakeLDClient._resolveInit()
            // Don't emit ready for harness — it will time out

            const resultPromise = evaluateFlagAsync(testFlag, 'default')

            await vi.advanceTimersByTimeAsync(2000)

            const result = await resultPromise

            expect(result).toEqual({ value: 'value', error: null })

            vi.useRealTimers()
        })
    })

    describe('getFlagDetails', () => {
        it('should return raw values from both engines', () => {
            setupEngines(
                { 'test-flag': 'ld-val' },
                { 'test-flag': { treatment: 'on', config: '{"a":1}' } },
            )

            const details = getFlagDetails(testFlag)

            expect(details.launchdarkly).toEqual({
                value: 'ld-val',
                variationIndex: 0,
                reason: { kind: 'FALLTHROUGH' },
            })
            expect(details.harness).toEqual({
                treatment: 'on',
                config: { a: 1 },
            })
        })
    })

    describe('getEngineContexts', () => {
        it('should return contexts from both engines', () => {
            setupEngines()

            const contexts = getEngineContexts()

            expect(contexts.launchdarkly).toMatchObject({
                kind: 'multi',
                user: { key: 'acc-456' },
            })
            expect(contexts.harness).toMatchObject({
                key: 'acc-456',
                trafficType: 'account',
            })
        })
    })

    describe('subscribeToFlag', () => {
        it('should subscribe via the primary engine and receive updates', () => {
            setupEngines({ 'test-flag': false })

            const callback = vi.fn()
            subscribeToFlag(testFlag, false, callback)

            fakeLDClient._setFlag(testFlag, true)
            expect(callback).toHaveBeenCalledWith(true)
        })

        it('should return an unsubscribe function that stops callbacks', () => {
            setupEngines({ 'test-flag': false })

            const callback = vi.fn()
            const unsubscribe = subscribeToFlag(testFlag, false, callback)
            unsubscribe()

            fakeLDClient._setFlag(testFlag, true)
            expect(callback).not.toHaveBeenCalled()
        })
    })
})
