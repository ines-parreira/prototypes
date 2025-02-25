import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { fromJS, Map } from 'immutable'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import thunk from 'redux-thunk'

import client from 'models/api/resources'
import { searchCustomers } from 'models/customer/resources'
import { Customer } from 'models/customer/types'
import * as actions from 'state/infobar/actions'
import {
    SEARCH_CUSTOMERS_ERROR,
    SEARCH_CUSTOMERS_START,
    SEARCH_CUSTOMERS_SUCCESS,
} from 'state/infobar/constants'
import { initialState } from 'state/infobar/reducers'
import { StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

type MockedRootState = {
    infobar: Map<any, any>
    ticket: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares,
)

jest.mock('models/customer/resources')
const searchCustomersMock = assumeMock(searchCustomers)

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn((args: Record<string, unknown>) => ({
            ...args,
            type: 'NOTIFY-MOCK',
        })),
    }
})

jest.mock('../../../utils', () => {
    const utils: Record<string, unknown> = jest.requireActual('../../../utils')

    return {
        ...utils,
        isCurrentlyOnTicket: jest.fn((ticketId) => ticketId === 1),
    }
})

describe('infobar actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({
            infobar: initialState,
            ticket: fromJS({ id: 1 }),
        })
        mockServer = new MockAdapter(client)
    })

    describe('searchWithHighlights', () => {
        it('should dispatch search results on success', () => {
            const payload = {
                data: {
                    data: [
                        {
                            entity: { id: 1, name: 'alex' } as Customer,
                            highlights: {},
                        },
                    ],
                },
            }
            searchCustomersMock.mockResolvedValueOnce(payload as any)

            return store
                .dispatch(actions.searchWithHighlights('alex'))
                .then(() =>
                    expect(store.getActions()).toEqual([
                        {
                            type: SEARCH_CUSTOMERS_START,
                        },
                        {
                            resp: payload,
                            type: SEARCH_CUSTOMERS_SUCCESS,
                        },
                    ]),
                )
        })

        it('should not dispatch results when cancelling the search', () => {
            const source = axios.CancelToken.source()
            searchCustomersMock.mockRejectedValue(new axios.CanceledError())

            return store
                .dispatch(actions.searchWithHighlights('alex', source.token))
                .finally(() =>
                    expect(store.getActions()).toEqual([
                        {
                            type: SEARCH_CUSTOMERS_START,
                        },
                    ]),
                )
        })

        it('should dispatch an error', () => {
            searchCustomersMock.mockRejectedValue(
                new axios.AxiosError('some error message'),
            )

            return store
                .dispatch(actions.searchWithHighlights('alex'))
                .finally(() =>
                    expect(store.getActions()).toEqual([
                        {
                            type: SEARCH_CUSTOMERS_START,
                        },
                        {
                            error: {
                                message: 'some error message',
                                name: 'AxiosError',
                            },
                            reason: 'Failed to do the search. Please try again...',
                            type: SEARCH_CUSTOMERS_ERROR,
                        },
                    ]),
                )
        })
    })

    describe('similarCustomer', () => {
        it('should resolve with a similar customer', () => {
            mockServer
                .onGet('/api/customers/1/similar/')
                .reply(200, { id: 1, name: 'alex' })

            return store
                .dispatch(actions.similarCustomer('1'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should resolve to undefined on 404', () => {
            mockServer.onGet('/api/customers/2/similar/').reply(404)

            return store
                .dispatch(actions.similarCustomer('2'))
                .then((res) => expect(res).toBe(undefined))
        })

        it('should reject on any error', () => {
            mockServer.onGet('/api/customers/2/similar/').reply(505)

            return store
                .dispatch(actions.similarCustomer('2'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('execute action', () => {
        const actionName = 'shopifyRefundShippingCostOfOrder'
        const integrationId = 5
        const appId = 'foo'
        const customerId = '34'
        const payload = { order_id: 4194477515 }
        const callback = jest.fn()

        it('success', () => {
            mockServer.onPost('/api/actions/execute/').reply(200)

            store.dispatch(
                actions.executeAction({
                    actionName,
                    integrationId,
                    appId,
                    customerId,
                    payload,
                    callback,
                }),
            )
            expect(store.getActions()).toMatchSnapshot()
        })

        it('fail', (done) => {
            mockServer.onPost('/api/actions/execute/').reply(400)

            store.dispatch(
                actions.executeAction({
                    actionName,
                    integrationId,
                    appId,
                    customerId,
                    payload,
                    callback,
                }),
            )
            process.nextTick(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })
    })

    describe('handle executed action', () => {
        type HandleExecutedActionArgumentType = Parameters<
            typeof actions.handleExecutedAction
        >[0]

        it('success', () => {
            const response = {
                status: 'success',
                action_id: 'someId',
                payload: {},
            } as HandleExecutedActionArgumentType

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('display error', () => {
            const response = {
                status: 'error',
                action_id: 'someId',
                msg: '[SHOPIFY] [full-refund] No way',
                payload: {},
            } as HandleExecutedActionArgumentType

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('display error from ticket currently on', () => {
            const response = {
                status: 'error',
                action_id: 'someId',
                ticket_id: '1',
                msg: '[SHOPIFY] [full-refund] No way',
                payload: {},
            } as HandleExecutedActionArgumentType

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('display error from ticket not currently on', () => {
            const response = {
                status: 'error',
                action_id: 'someId',
                ticket_id: '2',
                msg: '[SHOPIFY] [full-refund] No way',
                payload: {},
            } as HandleExecutedActionArgumentType

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
