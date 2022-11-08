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
    toInitialStoreState,
} from 'init'
import {RootState} from 'state/types'
import {initLogRocket} from 'utils/logRocket'
import {mockStagingEnvironment} from 'utils/testing'
import {account} from 'fixtures/account'
import {user} from 'fixtures/users'
import {GorgiasInitialState} from 'types'

const mockStore = configureMockStore([thunk])

jest.mock('utils/logRocket')
const initLogRocketMock = initLogRocket as jest.MockedFunction<
    typeof initLogRocket
>

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
                                address: `asdasd@${window.EMAIL_FORWARDING_DOMAIN}`,
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
                                address: `asdasd@${window.EMAIL_FORWARDING_DOMAIN}`,
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

    describe('toInitialStoreState()', () => {
        it('should return the expected store state', () => {
            expect(toInitialStoreState(initialState)).toMatchSnapshot()
        })
    })

    describe('initApp', () => {
        const defaultParams: InitAppParams = {
            sentry: false,
            datadog: false,
            logRocket: {
                appId: 'foo',
                sampleRate: 1,
            },
        }

        beforeEach(() => {
            mockStagingEnvironment()
            window.GORGIAS_STATE = {
                currentAccount: account,
                currentUser: user,
            } as GorgiasInitialState
            jest.spyOn(global.Math, 'random').mockReturnValue(0)
        })

        it('should initialize log rocket when random() returns a number smaller/equal than the sample rate', () => {
            initApp(defaultParams)

            expect(initLogRocketMock).toHaveBeenLastCalledWith({
                appId: defaultParams.logRocket?.appId,
                currentAccount: account,
                currentUser: user,
                release: window.GORGIAS_RELEASE,
            })
        })

        it('should not initialize log rocket when random() returns a number higher than the sample rate', () => {
            jest.spyOn(global.Math, 'random').mockReturnValue(0.3)
            initApp({
                ...defaultParams,
                logRocket: {
                    ...defaultParams.logRocket!,
                    sampleRate: 0.1,
                },
            })

            expect(initLogRocketMock).not.toHaveBeenCalled()
        })
    })
})
