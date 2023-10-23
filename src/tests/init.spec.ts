import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import {EMAIL_INTEGRATION_TYPE} from 'constants/integration'
import {initApp, notifyAccountNotVerified, notifyUserImpersonated} from 'init'
import {RootState} from 'state/types'
import {user} from 'fixtures/users'
import {
    mockDevelopmentEnvironment,
    mockProductionEnvironment,
    mockStagingEnvironment,
} from 'utils/testing'
import {GorgiasInitialState, InitialReactQueryState} from 'types'
import {account} from 'fixtures/account'
import {initDatadogLogger, initDatadogRum} from 'utils/datadog'
import {GorgiasUIEnv} from 'utils/environment'
import {initErrorReporter} from 'utils/errors'

const mockStore = configureMockStore([thunk])

type fromJSType = typeof fromJS

jest.mock('common/store', () => {
    const {fromJS} = jest.requireActual('immutable')
    return {
        store: {
            dispatch: jest.fn(),
            getState: () => ({
                billing: (fromJS as fromJSType)([]),
                currentAccount: (fromJS as fromJSType)({id: 1}),
                currentUser: (fromJS as fromJSType)({id: 1}),
            }),
        },
    }
})

jest.mock('utils/datadog')
jest.mock('utils/errors')
jest.mock('utils/launchDarkly')

describe('init', () => {
    let reduxStore: MockStoreEnhanced<unknown>

    describe('notifyAccountNotVerified()', () => {
        it('should not do anything because the base email integration is verified', () => {
            reduxStore = mockStore({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: EMAIL_INTEGRATION_TYPE,
                            meta: {
                                address: `asdasd@${
                                    window.GORGIAS_STATE?.integrations
                                        ?.authentication?.email
                                        ?.forwarding_email_address || ''
                                }`,
                                verified: true,
                            },
                        },
                    ],
                }),
            })

            notifyAccountNotVerified(reduxStore)

            expect(reduxStore.getActions()).toMatchSnapshot()
        })

        it('should dispatch a notification because the base email integration is not verified', () => {
            reduxStore = mockStore({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: EMAIL_INTEGRATION_TYPE,
                            meta: {
                                address: `asdasd@${
                                    window.GORGIAS_STATE?.integrations
                                        ?.authentication?.email
                                        ?.forwarding_email_address || ''
                                }`,
                                verified: false,
                            },
                        },
                    ],
                }),
            })

            notifyAccountNotVerified(reduxStore)

            expect(reduxStore.getActions()).toMatchSnapshot()
        })
    })

    describe('notifyUserImpersonated()', () => {
        beforeEach(() => {
            window.USER_IMPERSONATED = null
            reduxStore = mockStore({currentUser: fromJS(user)} as RootState)
        })

        it('should not do anything because user is not impersonated', () => {
            notifyUserImpersonated(reduxStore)

            expect(reduxStore.getActions()).toMatchSnapshot()
        })

        it('should dispatch a notification because user is impersonated', () => {
            window.USER_IMPERSONATED = true
            notifyUserImpersonated(reduxStore)

            expect(reduxStore.getActions()).toMatchSnapshot()
        })
    })

    describe('initApp()', () => {
        const defaultSentryDsn = 'test-sentry-dsn'
        const defaultGorgiasRelease = 'test-gorgias-release'
        const defaultGorgiasState = {
            currentAccount: account,
            currentUser: user,
        } as GorgiasInitialState & InitialReactQueryState
        const defaultEnvironment = GorgiasUIEnv.Development

        beforeEach(() => {
            window.SENTRY_DSN = defaultSentryDsn
            window.GORGIAS_RELEASE = defaultGorgiasRelease
            window.GORGIAS_STATE = defaultGorgiasState
            mockDevelopmentEnvironment()
        })

        it.each([
            {environment: GorgiasUIEnv.Staging, setup: mockStagingEnvironment},
            {
                environment: GorgiasUIEnv.Production,
                setup: mockProductionEnvironment,
            },
        ])(
            'should init datadog rum and logger on $environment environment',
            ({setup, environment}) => {
                setup()

                initApp()

                expect(initDatadogRum).toHaveBeenLastCalledWith({
                    account,
                    user,
                    environment,
                    version: defaultGorgiasRelease,
                })
                expect(initDatadogLogger).toHaveBeenLastCalledWith({
                    account,
                    user,
                    environment,
                    version: defaultGorgiasRelease,
                })
            }
        )

        it('should not init datadog rum and logger on development environment', () => {
            initApp()

            expect(initDatadogRum).not.toHaveBeenCalled()
            expect(initDatadogLogger).not.toHaveBeenCalled()
        })

        it('should init error reporter when SENTRY_DSN is defined', () => {
            initApp()

            expect(initErrorReporter).toHaveBeenLastCalledWith({
                dsn: defaultSentryDsn,
                release: defaultGorgiasRelease,
                environment: defaultEnvironment,
                currentUser: defaultGorgiasState.currentUser,
                currentAccount: defaultGorgiasState.currentAccount,
            })
        })

        it('should not init error reporter when SENTRY_DSN is an empty string', () => {
            window.SENTRY_DSN = ''

            initApp()

            expect(initErrorReporter).not.toHaveBeenCalled()
        })
    })
})
