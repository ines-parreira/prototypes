import { isDevelopment } from '@repo/utils'
import * as LDClient from 'launchdarkly-js-client-sdk'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import * as launchDarkly from '../launchdarkly'

vi.mock('launchdarkly-js-client-sdk', () => ({
    initialize: vi.fn(),
}))
const mockInitialize = vi.mocked(LDClient.initialize)
vi.mock('@repo/utils', () => ({
    isDevelopment: vi.fn(),
}))
const mockIsDevelopment = vi.mocked(isDevelopment)

type User = {
    id: string
    name: string
    email: string
}

type Account = {
    id: string
    domain: string
}

const user: User = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
}

const account: Account = {
    id: '456',
    domain: 'test.com',
}

describe('launchDarkly', () => {
    beforeAll(() => {
        window.GORGIAS_LAUNCHDARKLY_CLIENT_ID = 'test-client-id'
        window.GORGIAS_CLUSTER = 'test-cluster'
    })

    beforeEach(() => {
        window.USER_IMPERSONATED = null
        launchDarkly._setLDContext({})
        vi.resetAllMocks()
        mockIsDevelopment.mockReturnValue(false)
    })

    describe('getLDClient', () => {
        it('returns the module-level client instance', async () => {
            const uninitializedClient = launchDarkly.getLDClient()
            const initializedClient = launchDarkly.initLaunchDarkly(
                user,
                account,
            )
            const client = launchDarkly.getLDClient()
            expect(uninitializedClient).toBeUndefined()
            expect(initializedClient).toBe(client)
        })
    })

    describe('initLaunchDarkly', () => {
        it('undefined user', async () => {
            launchDarkly.initLaunchDarkly(undefined as any, account)

            expect(mockInitialize).toHaveBeenCalledWith(
                'test-client-id',
                {},
                { bootstrap: 'localStorage' },
            )
        })

        it('undefined account', async () => {
            launchDarkly.initLaunchDarkly(user, undefined as any)

            expect(mockInitialize).toHaveBeenCalledWith(
                'test-client-id',
                {},
                { bootstrap: 'localStorage' },
            )
        })

        it('initialization with all data', async () => {
            launchDarkly.initLaunchDarkly(
                user,
                account,
                'helpdesk-123',
                'automation-456',
            )

            expect(mockInitialize).toHaveBeenCalledWith(
                'test-client-id',
                {
                    kind: 'multi',
                    user: {
                        kind: 'user',
                        key: '456',
                        helpdeskPriceId: 'helpdesk-123',
                        automationPriceId: 'automation-456',
                        userId: '123',
                        domain: 'test.com',
                        cluster: 'test-cluster',
                        userImpersonated: false,
                    },
                },
                { bootstrap: 'localStorage' },
            )
        })

        it('error handling', async () => {
            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {})
            const error = new Error('LaunchDarkly initialization failed')
            mockInitialize.mockImplementation(() => {
                throw error
            })

            launchDarkly.initLaunchDarkly(user, account)

            expect(consoleSpy).toHaveBeenCalledWith(error)
            consoleSpy.mockRestore()
        })

        it('development context', async () => {
            mockIsDevelopment.mockReturnValue(true)
            process.env.DEVELOPER_NAME = 'mario'

            launchDarkly.initLaunchDarkly(user, account)

            expect(mockInitialize).toHaveBeenCalledWith(
                'test-client-id',
                {
                    kind: 'multi',
                    user: {
                        kind: 'user',
                        key: '456',
                        userId: '123',
                        domain: 'test.com',
                        cluster: 'test-cluster',
                        userImpersonated: false,
                    },
                    developer: {
                        key: process.env.DEVELOPER_NAME,
                    },
                },
                { bootstrap: 'localStorage' },
            )
        })

        it('development context, missing dev name', async () => {
            mockIsDevelopment.mockReturnValue(true)
            delete process.env.DEVELOPER_NAME

            launchDarkly.initLaunchDarkly(user, account)

            expect(mockInitialize).toHaveBeenCalledWith(
                'test-client-id',
                {
                    kind: 'multi',
                    user: {
                        kind: 'user',
                        key: '456',
                        userId: '123',
                        domain: 'test.com',
                        cluster: 'test-cluster',
                        userImpersonated: false,
                    },
                    developer: {
                        key: 'anonymous',
                    },
                },
                { bootstrap: 'localStorage' },
            )
        })

        it('impersonation', async () => {
            window.USER_IMPERSONATED = true

            launchDarkly.initLaunchDarkly(user, account)

            expect(mockInitialize).toHaveBeenCalledWith(
                'test-client-id',
                {
                    kind: 'multi',
                    user: {
                        kind: 'user',
                        key: '456',
                        userId: '123',
                        domain: 'test.com',
                        cluster: 'test-cluster',
                        userImpersonated: true,
                    },
                },
                { bootstrap: 'localStorage' },
            )
        })
    })
})
