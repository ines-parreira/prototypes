import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import {EMAIL_INTEGRATION_TYPE} from '../constants/integration'
import {initialState} from '../fixtures/initialState'
import {
    notifyAccountNotVerified,
    notifyDeprecatedTld,
    toInitialStoreState,
} from '../init'
import {RootState} from '../state/types'

const mockStore = configureMockStore([thunk])

describe('init', () => {
    let reduxStore: MockStoreEnhanced<unknown>

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
})
