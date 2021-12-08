import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import * as actions from '../actions'
import {initialState} from '../reducers'
import client from '../../../models/api/resources'
import {StoreDispatch} from '../../types'
import {Customer, CustomerDraft} from '../types'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(() => (args: unknown) => args),
    }
})
jest.mock('reapop', () => {
    const reapop: Record<string, unknown> = require.requireActual('reapop')

    return {
        ...reapop,
        updateNotification: jest.fn(() => (args: unknown) => args),
    }
})

describe('customers actions', () => {
    let store: MockStoreEnhanced<unknown, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({customers: initialState})
        mockServer = new MockAdapter(client)
    })

    it('fetch customer', () => {
        mockServer.onGet('/api/customers/2/').reply(200, {data: {id: 2}})

        return store
            .dispatch(actions.fetchCustomer('2'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('create customer', () => {
        const data = {
            name: 'Steve',
            email: 'steve@acme.gorgias.io',
        } as unknown as CustomerDraft

        mockServer.onPost('/api/customers/').reply(200, {data})

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

        mockServer.onPut('/api/customers/2/').reply(200, {data})

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
            .reply(200, {data: [{id: 1}]})

        return store
            .dispatch(actions.fetchCustomerHistory(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
            .then(() => {
                store.clearActions()

                return store
                    .dispatch(
                        actions.fetchCustomerHistory(2, {
                            successCondition: () => false,
                        })
                    )
                    .then(() => expect(store.getActions()).toMatchSnapshot())
            })
    })

    it('merge customers', () => {
        mockServer
            .onPut('/api/customers/merge?target_id=2&source_id=3')
            .reply(200, {data: [{id: 1}]})

        return store
            .dispatch(actions.mergeCustomers(2, 3, {} as Customer))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
