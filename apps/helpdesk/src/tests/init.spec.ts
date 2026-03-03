import * as logging from '@repo/logging'
import { assumeMock } from '@repo/testing'
import * as envUtils from '@repo/utils'
import type { fromJS } from 'immutable'
import { initApp } from 'init'

import { store } from 'common/store'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { GorgiasInitialState, InitialReactQueryState } from 'types'
import { initErrorReporter } from 'utils/errors'
import { identifyUser } from 'utils/hotjar'
import { initSDKs } from 'utils/sdk'

type fromJSType = typeof fromJS

jest.mock('common/store', () => {
    const { fromJS } = jest.requireActual('immutable')
    return {
        store: {
            dispatch: jest.fn(),
            getState: () => ({
                billing: fromJS({
                    products: [
                        {
                            type: 'automate',
                            prices: [
                                {
                                    plan_id: 'automate-USD5',
                                    amount: 100,
                                    num_quota_tickets: 1000,
                                },
                            ],
                        },
                    ],
                }),
                currentAccount: (fromJS as fromJSType)({ id: 1 }),
                currentUser: (fromJS as fromJSType)({ id: 1 }),
            }),
        },
    }
})

jest.mock('state/billing/selectors', () => ({
    ...jest.requireActual('state/billing/selectors'),
    getHasAutomate: jest.fn(() => true),
    getCurrentAutomatePlan: jest.fn(() => ({
        id: 1,
        name: 'USD5',
        generation: 5,
    })),
}))

jest.mock('utils/sdk')
jest.mock('utils/errors')
jest.mock('@repo/feature-flags')
jest.mock('utils/hotjar')
jest.mock('@repo/logging')
jest.mock('state/notifications/actions')

jest.mock('@repo/utils')
const envVarsMock = envUtils.envVars as envUtils.EnvVars
const getEnvironmentMock = assumeMock(envUtils.getEnvironment)
const isDevelopmentMock = assumeMock(envUtils.isDevelopment)
const isStagingMock = assumeMock(envUtils.isStaging)
const isProductionMock = assumeMock(envUtils.isProduction)

const logEventMock = assumeMock(logging.logEvent)

describe('init', () => {
    beforeEach(() => {
        getEnvironmentMock.mockReturnValue(envUtils.GorgiasUIEnv.Development)
        isDevelopmentMock.mockReturnValue(false)
        isStagingMock.mockReturnValue(false)
        isProductionMock.mockReturnValue(false)
    })

    describe('initApp()', () => {
        const defaultSentryDsn = 'test-sentry-dsn'
        const defaultGorgiasRelease = 'test-gorgias-release'
        const defaultWebAppRelease = 'test-web-app-release'
        const defaultGorgiasState = {
            currentAccount: account,
            currentUser: user,
        } as GorgiasInitialState & InitialReactQueryState
        const defaultEnvironment = envUtils.GorgiasUIEnv.Development

        beforeEach(() => {
            window.SENTRY_DSN = defaultSentryDsn
            window.GORGIAS_RELEASE = defaultGorgiasRelease
            envVarsMock.WEB_APP_RELEASE = defaultWebAppRelease
            window.GORGIAS_STATE = defaultGorgiasState
            getEnvironmentMock.mockReturnValue(
                envUtils.GorgiasUIEnv.Development,
            )
            delete window.SEGMENT_EVENTS_TO_TRACK
            logEventMock.mockClear()
        })

        describe.each([
            {
                environment: envUtils.GorgiasUIEnv.Staging,
                setup: () => isStagingMock.mockReturnValue(true),
            },
            {
                environment: envUtils.GorgiasUIEnv.Production,
                setup: () => isProductionMock.mockReturnValue(true),
            },
        ])('$environment environment', ({ environment, setup }) => {
            beforeEach(() => {
                getEnvironmentMock.mockReturnValue(environment)
                setup()
            })

            it('should init datadog rum', () => {
                const expectedParams: Parameters<
                    typeof logging.initDatadogRum
                > = [
                    {
                        account,
                        user,
                        environment,
                        serverVersion: defaultGorgiasRelease,
                        clientVersion: defaultWebAppRelease,
                    },
                ]

                initApp()

                expect(logging.initDatadogRum).toHaveBeenLastCalledWith(
                    ...expectedParams,
                )
            })

            it('should init datadog logger', () => {
                const expectedParams: Parameters<
                    typeof logging.initDatadogLogger
                > = [
                    {
                        account,
                        user,
                        environment,
                        serverVersion: defaultGorgiasRelease,
                        clientVersion: defaultWebAppRelease,
                    },
                ]

                initApp()

                expect(logging.initDatadogLogger).toHaveBeenLastCalledWith(
                    ...expectedParams,
                )
            })
        })

        it('should not init datadog rum and logger on development environment', () => {
            initApp()

            expect(logging.initDatadogRum).not.toHaveBeenCalled()
            expect(logging.initDatadogLogger).not.toHaveBeenCalled()
        })

        it('should init error reporter when SENTRY_DSN is defined', () => {
            const expectedParams: Parameters<typeof initErrorReporter> = [
                {
                    dsn: defaultSentryDsn,
                    serverVersion: defaultGorgiasRelease,
                    clientVersion: defaultWebAppRelease,
                    environment: defaultEnvironment,
                    currentUser: defaultGorgiasState.currentUser,
                    currentAccount: defaultGorgiasState.currentAccount,
                },
            ]

            initApp()

            expect(initErrorReporter).toHaveBeenLastCalledWith(
                ...expectedParams,
            )
        })

        it('should not init error reporter when SENTRY_DSN is an empty string', () => {
            window.SENTRY_DSN = ''

            initApp()

            expect(initErrorReporter).not.toHaveBeenCalled()
        })

        it('should identify hotjar user', () => {
            initApp()

            expect(identifyUser).toHaveBeenCalledWith({
                serverVersion: defaultGorgiasRelease,
                clientVersion: defaultWebAppRelease,
                currentUser: defaultGorgiasState.currentUser,
                currentAccount: defaultGorgiasState.currentAccount,
                automatePlan: {
                    generation: 5,
                    id: 1,
                    name: 'USD5',
                },
            })
        })

        it('should init sdk libs', () => {
            initApp()

            expect(initSDKs).toHaveBeenCalled()
        })

        describe('SEGMENT_EVENTS_TO_TRACK', () => {
            it('should log events when eventsToTrack is not empty', () => {
                const event1 = {
                    type: 'test-event-1',
                    data: { prop1: 'value1' },
                }
                const event2 = {
                    type: 'test-event-2',
                    data: { prop2: 'value2' },
                }
                window.SEGMENT_EVENTS_TO_TRACK = [event1, event2]

                initApp()

                expect(logEventMock).toHaveBeenCalledTimes(2)
                expect(logEventMock).toHaveBeenNthCalledWith(
                    1,
                    event1.type,
                    event1.data,
                )
                expect(logEventMock).toHaveBeenNthCalledWith(
                    2,
                    event2.type,
                    event2.data,
                )
            })

            it('should delete SEGMENT_EVENTS_TO_TRACK after processing', () => {
                const event = {
                    type: 'test-event',
                    data: { prop: 'value' },
                }
                window.SEGMENT_EVENTS_TO_TRACK = [event]

                initApp()

                expect(window.SEGMENT_EVENTS_TO_TRACK).toBeUndefined()
            })

            it('should handle single event', () => {
                const event = {
                    type: 'single-event',
                    data: { key: 'value' },
                }
                window.SEGMENT_EVENTS_TO_TRACK = [event]

                initApp()

                expect(logEventMock).toHaveBeenCalledTimes(1)
                expect(logEventMock).toHaveBeenCalledWith(
                    event.type,
                    event.data,
                )
            })

            it('should not log events when eventsToTrack is undefined', () => {
                window.SEGMENT_EVENTS_TO_TRACK = undefined

                initApp()

                expect(logEventMock).not.toHaveBeenCalled()
            })

            it('should not log events when eventsToTrack is empty array', () => {
                window.SEGMENT_EVENTS_TO_TRACK = []

                initApp()

                expect(logEventMock).not.toHaveBeenCalled()
            })
        })

        describe('dispatches window.SYSTEM_MESSAGES', () => {
            it('should dispatch system messages', () => {
                window.SYSTEM_MESSAGES = [
                    [NotificationStatus.Info, 'test-message'],
                ]

                initApp()

                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Info,
                    message: 'test-message',
                })
                expect(store.dispatch).toHaveBeenCalledTimes(1)
            })
        })
    })
})
