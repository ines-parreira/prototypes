import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import {EMAIL_INTEGRATION_TYPE} from 'constants/integration'
import {initialState} from 'fixtures/initialState'
import {
    notifyAccountNotVerified,
    notifyDeprecatedTld,
    notifyUserImpersonated,
    toInitialStoreState,
} from 'init'
import {RootState} from 'state/types'
import {user} from 'fixtures/users'

const mockStore = configureMockStore([thunk])

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
})
