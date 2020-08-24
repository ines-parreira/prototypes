import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import axios, {CancelToken} from 'axios'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions.ts'
import {initialState} from '../reducers.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn((args) => ({...args, type: 'NOTIFY-MOCK'})),
    }
})

jest.mock('../../../utils', () => {
    const utils = require.requireActual('../../../utils')

    return {
        ...utils,
        isCurrentlyOnTicket: jest.fn((ticketId) => ticketId === 1),
    }
})

describe('infobar actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({
            infobar: initialState,
            ticket: fromJS({id: 1}),
        })
        mockServer = new MockAdapter(axios)
    })

    describe('search', () => {
        it('should dispatch search results on success', () => {
            mockServer
                .onPost('/api/search/')
                .reply(200, {data: [{id: 1, name: 'alex'}]})

            return store
                .dispatch(actions.search('alex'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should not dispatch results when cancelling the search', () => {
            mockServer
                .onPost('/api/search/')
                .reply(200, {data: [{id: 1, name: 'alex'}]})
            const source = CancelToken.source()
            source.cancel()

            return store
                .dispatch(actions.search('alex', source.token))
                .finally(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('similar customer', () => {
        mockServer
            .onGet('/api/customers/1/similar/')
            .reply(200, {id: 1, name: 'alex'})

        return store
            .dispatch(actions.similarCustomer(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('execute action', () => {
        const actionName = 'shopifyRefundShippingCostOfOrder'
        const integrationId = 5
        const customerId = 34
        const payload = {order_id: 4194477515}
        const callback = jest.fn()

        it('success', () => {
            mockServer.onPost('/api/actions/execute/').reply(200)

            return store
                .dispatch(
                    actions.executeAction(
                        actionName,
                        integrationId,
                        customerId,
                        payload,
                        callback
                    )
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('fail', () => {
            mockServer.onPost('/api/actions/execute/').reply(400)

            return store
                .dispatch(
                    actions.executeAction(
                        actionName,
                        integrationId,
                        customerId,
                        payload,
                        callback
                    )
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('handle executed action', () => {
        it('success', () => {
            const response = {
                status: 'success',
            }

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('display error', () => {
            const response = {
                status: 'error',
                msg: '[SHOPIFY] [full-refund] No way',
            }

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('display error from ticket currently on', () => {
            const response = {
                status: 'error',
                ticket_id: 1,
                msg: '[SHOPIFY] [full-refund] No way',
            }

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('display error from ticket not currently on', () => {
            const response = {
                status: 'error',
                ticket_id: 2,
                msg: '[SHOPIFY] [full-refund] No way',
            }

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
