import { isDevelopment } from '@repo/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createFakeLDClient } from '../../tests/fakeLDClient'
import { createEngine as createLDEngine } from '../launchdarkly'

let currentClient: ReturnType<typeof createFakeLDClient>

vi.mock('@repo/utils', () => ({
    isDevelopment: vi.fn().mockReturnValue(false),
}))

vi.mock('launchdarkly-js-client-sdk', () => ({
    initialize: (clientId: string, ...__args: unknown[]) => {
        if (!clientId) throw new Error('Client ID is required')
        return currentClient
    },
}))

function createMockEngine(flags: Record<string, unknown> = {}) {
    currentClient = createFakeLDClient(flags)
    const engine = createLDEngine()
    return { engine, client: currentClient }
}

describe('launchdarkly engine', () => {
    beforeEach(() => {
        vi.mocked(isDevelopment).mockReturnValue(false)
        window.GORGIAS_LAUNCHDARKLY_CLIENT_ID = 'ld-key'
        window.GORGIAS_CLUSTER = 'test-cluster'
        window.USER_IMPERSONATED = null
    })

    describe('initialize', () => {
        it('builds multi-context with user attributes', () => {
            const { engine } = createMockEngine()
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getContext()).toEqual({
                kind: 'multi',
                user: {
                    kind: 'user',
                    key: '456',
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })
        })

        it('uses empty context when key is empty', () => {
            const { engine } = createMockEngine()
            engine.initialize({ key: '', attributes: {} })
            expect(engine.getContext()).toEqual({})
        })

        it('includes developer context in development mode', () => {
            vi.mocked(isDevelopment).mockReturnValue(true)
            process.env.DEVELOPER_NAME = 'mario'

            const { engine } = createMockEngine()
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getContext()).toMatchObject({
                developer: { key: 'mario' },
            })

            delete process.env.DEVELOPER_NAME
        })

        it('uses anonymous when developer name is missing', () => {
            vi.mocked(isDevelopment).mockReturnValue(true)
            delete process.env.DEVELOPER_NAME

            const { engine } = createMockEngine()
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getContext()).toMatchObject({
                developer: { key: 'anonymous' },
            })
        })

        it('logs error when LDClient.initialize throws', () => {
            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {})
            window.GORGIAS_LAUNCHDARKLY_CLIENT_ID = undefined as any

            const { engine } = createMockEngine()
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })
    })

    describe('evaluate', () => {
        it('returns flag value', () => {
            const { engine } = createMockEngine({ 'my-flag': true })
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

        it('returns default when flag is missing', () => {
            const { engine } = createMockEngine()
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.evaluate('missing', 'fallback')).toBe('fallback')
        })

        it('returns default when client is undefined', () => {
            const { engine } = createMockEngine()
            expect(engine.evaluate('any', 'safe')).toBe('safe')
        })
    })

    describe('getRawValue', () => {
        it('returns variation detail', () => {
            const { engine } = createMockEngine({ 'my-flag': 'val' })
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
                value: 'val',
                variationIndex: 0,
                reason: { kind: 'FALLTHROUGH' },
            })
        })

        it('returns undefined when no client', () => {
            const { engine } = createMockEngine()
            expect(engine.getRawValue('any')).toBeUndefined()
        })
    })

    describe('subscribe', () => {
        it('calls callback on flag change', () => {
            const { engine, client } = createMockEngine({ 'my-flag': false })
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

            client._setFlag('my-flag', true)
            expect(cb).toHaveBeenCalledWith(true)
        })

        it('unsubscribe stops callbacks', () => {
            const { engine, client } = createMockEngine({ 'my-flag': false })
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

            client._setFlag('my-flag', true)
            expect(cb).not.toHaveBeenCalled()
        })

        it('returns no-op when no client', () => {
            const { engine } = createMockEngine()
            const unsub = engine.subscribe('any', false, vi.fn())
            expect(unsub).toBeInstanceOf(Function)
        })
    })

    describe('getAllFlags', () => {
        it('returns all flags', () => {
            const { engine } = createMockEngine({ a: 1, b: 2 })
            engine.initialize({
                key: '456',
                attributes: {
                    userId: '123',
                    domain: 'test.com',
                    cluster: 'test',
                    userImpersonated: false,
                },
            })

            expect(engine.getAllFlags()).toEqual({ a: 1, b: 2 })
        })

        it('returns empty when no client', () => {
            const { engine } = createMockEngine()
            expect(engine.getAllFlags()).toEqual({})
        })
    })

    describe('getRawClient', () => {
        it('returns the client after initialization', () => {
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

            expect(engine.getRawClient()).toBe(client)
        })
    })

    describe('evaluateAsync', () => {
        it('resolves with flag value after initialization', async () => {
            const { engine, client } = createMockEngine({
                'my-flag': 'async-val',
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

            const promise = engine.evaluateAsync('my-flag', 'default')
            client._resolveInit()

            expect(await promise).toBe('async-val')
        })
    })

    describe('ensureInitialization', () => {
        it('resolves when client initializes successfully', async () => {
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
            client._resolveInit()
            await expect(promise).resolves.toBeUndefined()
            expect(engine.isReady()).toBe(true)
        })

        it('rejects when initialization fails', async () => {
            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {})
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
            client._rejectInit(new Error('timeout'))
            await expect(promise).rejects.toThrow('timeout')

            consoleSpy.mockRestore()
        })

        it('resolves immediately when no client', async () => {
            const { engine } = createMockEngine()
            await expect(engine.ensureInitialization()).resolves.toBeUndefined()
        })
    })
})
