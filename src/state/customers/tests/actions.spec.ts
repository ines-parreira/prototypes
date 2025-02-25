import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import thunk from 'redux-thunk'

import client from 'models/api/resources'
import { Customer, CustomerDraft } from 'models/customer/types'
import history from 'pages/history'
import { StoreDispatch } from 'state/types'

import * as actions from '../actions'
import { initialState } from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('pages/history')
jest.mock('state/notifications/actions', () => {
    return {
        notify: jest.fn((args: unknown) => () => ({ payload: args })),
    }
})
jest.mock('reapop', () => {
    const reapop: Record<string, unknown> = jest.requireActual('reapop')

    return {
        ...reapop,
        notify: jest.fn(() => (args: unknown) => args),
    }
})

describe('customers actions', () => {
    let store: MockStoreEnhanced<unknown, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({ customers: initialState })
        mockServer = new MockAdapter(client)
    })

    describe('fetch customer', () => {
        it('fetches customer', () => {
            mockServer
                .onGet('/api/customers/2/')
                .reply(200, { data: { id: 2 } })

            return store
                .dispatch(actions.fetchCustomer('2'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('fetches customer with highlights', () => {
            mockServer
                .onGet('/api/customers/2/')
                .reply(200, { data: [{ id: 2, highlights: { id: ['1'] } }] })

            return store.dispatch(actions.fetchCustomer('2')).then(() =>
                expect(store.getActions()).toMatchObject([
                    { type: 'FETCH_CUSTOMER_START' },
                    {
                        resp: { data: [{ highlights: { id: ['1'] }, id: 2 }] },
                        type: 'FETCH_CUSTOMER_SUCCESS',
                    },
                ]),
            )
        })

        describe('should correctly handle redirects for merged customers', () => {
            beforeEach(() => {
                mockServer.onGet(new RegExp('/api/customers/\\d+')).reply(200, {
                    id: 2,
                })
            })

            it('should redirect to the merged customer if the current URL is of the old (merged) customer', () => {
                window.location.pathname = '/app/customer/1'
                return store.dispatch(actions.fetchCustomer(1)).finally(() => {
                    expect(history.push).toHaveBeenCalledWith('/app/customer/2')
                })
            })

            it('should NOT redirect if the current URL is NOT of the merged customer', () => {
                window.location.pathname = '/app/customer/1'
                return store.dispatch(actions.fetchCustomer(99)).finally(() => {
                    expect(history.push).not.toHaveBeenCalled()
                })
            })
        })
    })

    it('create customer', () => {
        const data = {
            name: 'Steve',
            email: 'steve@acme.gorgias.io',
        } as unknown as CustomerDraft

        mockServer.onPost('/api/customers/').reply(200, { data })

        return store
            .dispatch(actions.submitCustomer(data))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('update customer', () => {
        const data = {
            id: 2,
            name: 'Steve',
            email: 'steve@acme.gorgias.io',
        } as unknown as Customer

        mockServer.onPut('/api/customers/2/').reply(200, { data })

        return store
            .dispatch(actions.submitCustomer(data, data.id))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('delete customer', () => {
        mockServer.onDelete('/api/customers/2/').reply(200)

        return store
            .dispatch(actions.deleteCustomer(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('bulkDeleteCustomer()', () => {
        const customersIds = fromJS([1, 2, 3, 4, 5])
        mockServer.onAny().reply(200)

        return store
            .dispatch(actions.bulkDeleteCustomer(customersIds))
            .then(() => {
                expect(mockServer.history).toMatchSnapshot()
                expect(store.getActions()).toMatchSnapshot()
            })
    })

    it('fetch customer history', () => {
        mockServer
            .onGet('/api/customers/2/tickets/')
            .reply(200, { data: [{ id: 1 }] })

        return store
            .dispatch(actions.fetchCustomerHistory(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
            .then(() => {
                store.clearActions()

                return store
                    .dispatch(
                        actions.fetchCustomerHistory(2, {
                            successCondition: () => false,
                        }),
                    )
                    .then(() => expect(store.getActions()).toMatchSnapshot())
            })
    })

    it('merge customers', () => {
        mockServer
            .onPut('/api/customers/merge?target_id=2&source_id=3')
            .reply(200, { data: [{ id: 1 }] })

        return store
            .dispatch(actions.mergeCustomers(2, 3, {} as Customer))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
