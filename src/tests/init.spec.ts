import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import {EMAIL_INTEGRATION_TYPE} from 'constants/integration'
import {initialState} from 'fixtures/initialState'
import {
    initApp,
    InitAppParams,
    notifyAccountNotVerified,
    notifyDeprecatedTld,
    notifyUserImpersonated,
    toInitialStoreState,
} from 'init'
import {RootState} from 'state/types'
import {user} from 'fixtures/users'
import {mockProductionEnvironment, mockStagingEnvironment} from 'utils/testing'
import {GorgiasInitialState} from 'types'
import {account} from 'fixtures/account'
import {initDatadogRum} from 'utils/datadog'

const mockStore = configureMockStore([thunk])

jest.mock('utils/datadog')

describe('init', () => {
    let reduxStore: MockStoreEnhanced<unknown>

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('notifyDeprecatedTld()', () => {
        beforeEach(() => {
            reduxStore = mockStore({} as RootState)
        })

        it("should not do anything because the URL's TLD is not `.io`", () => {
            notifyDeprecatedTld('https://acme.gorgias.com/', reduxStore)
            expect(reduxStore.getActions()).toMatchSnapshot()
        })

        it("should dispatch a notification because the URL's TLD is `.io`", () => {
            notifyDeprecatedTld('https://acme.gorgias.io/', reduxStore)
            expect(reduxStore.getActions()).toMatchSnapshot()
        })
    })

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

    describe('toInitialStoreState()', () => {
        it('should return the expected store state', () => {
            expect(toInitialStoreState(initialState)).toMatchSnapshot()
        })
    })

    describe('initApp()', () => {
        const defaultParams: InitAppParams = {
            sentry: false,
            datadog: false,
        }

        beforeEach(() => {
            mockStagingEnvironment()
            window.GORGIAS_STATE = {
                currentAccount: account,
                currentUser: user,
            } as GorgiasInitialState
        })

        describe.each([
            ['staging', mockStagingEnvironment],
            ['production', mockProductionEnvironment],
        ])('%s environment', () => {
            it('should not init datadog rum when datadog is disabled', () => {
                initApp(defaultParams)

                expect(initDatadogRum).not.toHaveBeenCalled()
            })
            it('should init datadog rum when datadog is enabled', () => {
                initApp({...defaultParams, datadog: true})

                expect(initDatadogRum).toHaveBeenLastCalledWith(
                    account,
                    user,
                    window.GORGIAS_RELEASE
                )
            })
        })
    })
})
