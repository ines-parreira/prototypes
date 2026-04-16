import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createFakeSplitClient } from '../../tests/fakeSplitClient'
import {
    createEngine as createHarnessEngine,
    normalizeFlagId,
} from '../harness'

type Treatment = { treatment: string; config: string | null }

let currentClient: ReturnType<typeof createFakeSplitClient>

vi.mock('@splitsoftware/splitio-browserjs', () => ({
    SplitFactory: () => ({ client: () => currentClient }),
    InLocalStorage: () => ({}),
}))

function createMockEngine(treatments: Record<string, Treatment> = {}) {
    currentClient = createFakeSplitClient(treatments)
    const engine = createHarnessEngine()
    return { engine, client: currentClient }
}

describe('harness engine', () => {
    beforeEach(() => {
        window.HARNESS_CLIENT_SDK_KEY = 'harness-key'
    })

    describe('initialize', () => {
        it('sets context with account traffic type by default', () => {
            const { engine } = createMockEngine()
            engine.initialize({
                key: 'acc-456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getContext()).toEqual({
                key: 'acc-456',
                trafficType: 'account',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                    key: 'acc-456',
                },
            })
        })

        it('always uses context key for user traffic type', () => {
            const { engine } = createMockEngine()
            engine.initialize({
                key: 'acc-456',
                trafficType: 'user',
                attributes: {
                    userId: 'usr-123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getContext()).toMatchObject({
                key: 'acc-456',
                trafficType: 'user',
            })
        })

        it('uses account key for account traffic type', () => {
            const { engine } = createMockEngine()
            engine.initialize({
                key: 'acc-456',
                trafficType: 'account',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getContext()).toMatchObject({
                key: 'acc-456',
                trafficType: 'account',
            })
        })

        it('does nothing when SDK key is missing', () => {
            window.HARNESS_CLIENT_SDK_KEY = undefined as any
            const { engine } = createMockEngine()

            engine.initialize({
                key: 'acc-456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('any', 'default')).toBe('default')
        })

        it('does nothing when flag context key is empty', () => {
            const { engine } = createMockEngine()
            engine.initialize({ key: '', attributes: {} })

            expect(engine.evaluate('any', 'default')).toBe('default')
        })
    })

    describe('evaluate', () => {
        it('coerces "on" to true for boolean default', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'on', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('my-flag', false)).toBe(true)
        })

        it('coerces "true" to true for boolean default', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'true', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('my-flag', false)).toBe(true)
        })

        it('coerces "off" to false for boolean default', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'off', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('my-flag', false)).toBe(false)
        })

        it('coerces number treatments', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: '42', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('my-flag', 0)).toBe(42)
        })

        it('returns default for NaN number treatments', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'not-a-number', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('my-flag', 99)).toBe(99)
        })

        it('parses JSON from config when present', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'on', config: '{"key":"value"}' },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('my-flag', {})).toEqual({ key: 'value' })
        })

        it('returns numeric config even when default is boolean', () => {
            const { engine } = createMockEngine({
                'my-flag': {
                    treatment: 'show-every-1hr',
                    config: '3600000',
                },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('my-flag', false)).toBe(3600000)
        })

        it('returns raw string for non-JSON string default', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'some-string', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('my-flag', 'default')).toBe('some-string')
        })

        it('returns default for control treatment', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'control', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('my-flag', 'my-default')).toBe('my-default')
        })

        it('returns default when not initialized', () => {
            const { engine } = createMockEngine()
            expect(engine.evaluate('any', 'safe')).toBe('safe')
        })
    })

    describe('getRawValue', () => {
        it('returns treatment and parsed JSON config', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'on', config: '{"a":1}' },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getRawValue('my-flag')).toEqual({
                treatment: 'on',
                config: { a: 1 },
            })
        })

        it('keeps config as string when JSON parse fails', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'on', config: 'not-json' },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getRawValue('my-flag')).toEqual({
                treatment: 'on',
                config: 'not-json',
            })
        })

        it('returns null config when config is null', () => {
            const { engine } = createMockEngine({
                'my-flag': { treatment: 'on', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getRawValue('my-flag')).toEqual({
                treatment: 'on',
                config: null,
            })
        })

        it('returns null when not initialized', () => {
            const { engine } = createMockEngine()
            expect(engine.getRawValue('any')).toBeNull()
        })
    })

    describe('evaluateAsync', () => {
        it('evaluates after initialization', async () => {
            const { engine, client } = createMockEngine({
                'my-flag': { treatment: 'on', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            const promise = engine.evaluateAsync('my-flag', false)
            client._emitReady()

            expect(await promise).toBe(true)
        })

        it('returns default when not initialized', async () => {
            const { engine } = createMockEngine()
            expect(await engine.evaluateAsync('any', 'safe')).toBe('safe')
        })
    })

    describe('subscribe', () => {
        it('calls callback on SDK_UPDATE', () => {
            const { engine, client } = createMockEngine({
                'my-flag': { treatment: 'off', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            const cb = vi.fn()
            engine.subscribe('my-flag', false, cb)

            client._setTreatment('my-flag', 'on')
            expect(cb).toHaveBeenCalledWith(true)
        })

        it('unsubscribe stops callbacks', () => {
            const { engine, client } = createMockEngine({
                'my-flag': { treatment: 'off', config: null },
            })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            const cb = vi.fn()
            const unsub = engine.subscribe('my-flag', false, cb)
            unsub()

            client._setTreatment('my-flag', 'on')
            expect(cb).not.toHaveBeenCalled()
        })

        it('returns no-op when not initialized', () => {
            const { engine } = createMockEngine()
            const unsub = engine.subscribe('any', false, vi.fn())
            expect(unsub).toBeInstanceOf(Function)
        })
    })

    describe('ensureInitialization', () => {
        it('resolves when SDK_READY fires', async () => {
            const { engine, client } = createMockEngine()
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            const promise = engine.ensureInitialization()
            client._emitReady()

            await expect(promise).resolves.toBeUndefined()
            expect(engine.isReady()).toBe(true)
        })

        it('returns the same promise on subsequent calls', async () => {
            const { engine, client } = createMockEngine()
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            const p1 = engine.ensureInitialization()
            const p2 = engine.ensureInitialization()
            expect(p1).toBe(p2)

            client._emitReady()
            await p1
        })

        it('rejects when SDK_READY_TIMED_OUT fires', async () => {
            const { engine, client } = createMockEngine()
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            const promise = engine.ensureInitialization()
            client._emitTimeout()

            await expect(promise).rejects.toThrow(
                'Harness SDK initialization timed out',
            )
        })

        it('resolves immediately when not initialized', async () => {
            const { engine } = createMockEngine()
            await expect(engine.ensureInitialization()).resolves.toBeUndefined()
        })
    })

    describe('normalizeFlagId', () => {
        it('replaces dots with dashes', () => {
            expect(normalizeFlagId('my.flag.name')).toBe('my-flag-name')
        })

        it('leaves flags without dots unchanged', () => {
            expect(normalizeFlagId('my-flag')).toBe('my-flag')
        })
    })
})
