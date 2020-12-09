import {fromJS, Map} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions'
import {initialState} from '../reducers'
import {StoreDispatch} from '../../types'
import {AccountSettingType, AccountSetting} from '../types'

type MockedRootState = {
    currentAccount: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: Record<string, unknown>) => args),
    }
})

describe('current account actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({currentAccount: initialState})
        mockServer = new MockAdapter(axios)
    })

    it('update account', () => {
        const data = {id: 2}

        mockServer.onPut('/api/account/').reply(200, data)

        return store
            .dispatch(actions.updateAccount(data as any))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('submit setting', () => {
        it('creation', () => {
            const data = {hello: 'world'}

            mockServer.onPost('/api/account/settings/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('update', () => {
            const data = {id: 1, hello: 'world'}

            mockServer.onPut('/api/account/settings/1/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('update account owner', () => {
        it('update account owner', (done) => {
            const userId = 1

            mockServer.onPut('/api/account/owner/', {id: userId}).reply(202)

            return store
                .dispatch(actions.updateAccountOwner(userId))
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
        })
    })

    describe('update subscription', () => {
        it('update subscription', () => {
            const subscription = {plan: 'basic'}

            mockServer
                .onPut('/api/billing/subscription/')
                .reply(202, subscription)

            return store
                .dispatch(actions.updateSubscription(subscription as any))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('setCurrentSubscription()', () => {
        it('should return a Redux action to set the current subscription.', () => {
            const subscription = {
                plan: 'basic-usd-1',
                status: 'active',
            }
            expect(
                actions.setCurrentSubscription(fromJS(subscription))
            ).toMatchSnapshot()
        })
    })

    describe('submitSettingSuccess', () => {
        it('should dispatch the next setting', () => {
            store = mockStore({currentAccount: initialState})
            const req = {
                data: {
                    views: {
                        1: {display_order: 2},
                    },
                    view_sections: {},
                },
                id: 1,
                type: AccountSettingType.ViewsOrdering,
            } as AccountSetting

            store.dispatch(actions.submitSettingSuccess(req, false))
            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
