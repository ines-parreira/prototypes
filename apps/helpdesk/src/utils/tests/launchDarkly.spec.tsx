import { isDevelopment } from '@repo/utils'
import * as LDClient from 'launchdarkly-js-client-sdk'

import type { User } from 'config/types/user'
import type { Account } from 'state/currentAccount/types'

import * as launchDarkly from '../launchDarkly'

jest.mock('launchdarkly-js-client-sdk', () => ({
    initialize: jest.fn(),
}))
const mockInitialize = jest.mocked(LDClient.initialize)
jest.mock('@repo/utils', () => ({
    isDevelopment: jest.fn(),
}))
const mockIsDevelopment = jest.mocked(isDevelopment)

jest.unmock('utils/launchDarkly') // mocked by default via __mocks__

const user: User = {
    id: 123,
    name: 'Test User',
    email: 'test@example.com',
} as User

const account: Account = {
    id: 456,
    domain: 'test.com',
} as Account

describe('launchDarkly', () => {
    beforeAll(() => {
        window.GORGIAS_LAUNCHDARKLY_CLIENT_ID = 'test-client-id'
        window.GORGIAS_CLUSTER = 'test-cluster'
    })

    beforeEach(() => {
        window.USER_IMPERSONATED = null
        launchDarkly._setLDContext({})
        jest.resetAllMocks()
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
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
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
