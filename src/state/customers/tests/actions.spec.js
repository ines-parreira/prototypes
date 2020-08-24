import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import * as actions from '../actions.ts'
import {initialState} from '../reducers.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})
jest.mock('reapop', () => {
    const reapop = require.requireActual('reapop')

    return {
        ...reapop,
        updateNotification: jest.fn(() => (args) => args),
    }
})

describe('customers actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({customers: initialState})
        mockServer = new MockAdapter(axios)
    })

    it('fetch customer', () => {
        mockServer.onGet('/api/customers/2/').reply(200, {data: {id: 2}})

        return store
            .dispatch(actions.fetchCustomer(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('create customer', () => {
        const data = {
            name: 'Steve',
            email: 'steve@acme.gorgias.io',
        }

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
        }

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
            .dispatch(actions.mergeCustomers(2, 3, {}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
