import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as actions from '../actions'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args) => args),
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
        mockServer.onGet('/api/users/2/').reply(200, {data: {id: 2}})

        return store.dispatch(actions.fetchCustomer(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('create customer', () => {
        const data = {
            name: 'Alex',
            email: 'alex@gorgias.io',
            role: 'agent'
        }

        mockServer.onPost('/api/users/').reply(200, {data})

        return store.dispatch(actions.submitCustomer(data))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('update customer', () => {
        const data = {
            id: 2,
            name: 'Alex',
            email: 'alex@gorgias.io',
            role: 'agent'
        }

        mockServer.onPut('/api/users/2/').reply(200, {data})

        return store.dispatch(actions.submitCustomer(data, data.id))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('delete customer', () => {
        mockServer.onDelete('/api/users/2/').reply(200)

        return store.dispatch(actions.deleteCustomer(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch customer history', () => {
        mockServer.onGet('/api/users/2/tickets/?type=customer').reply(200, {data: [{id: 1}]})

        return store.dispatch(actions.fetchCustomerHistory(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
            .then(() => {
                store.clearActions()

                store
                    .dispatch(actions.fetchCustomerHistory(2, {
                        successCondition: () => false,
                    }))
                    .then(() => expect(store.getActions()).toMatchSnapshot())
            })
    })

    it('merge customers', () => {
        mockServer.onPut('/api/users/2/merge/3/').reply(200, {data: [{id: 1}]})

        return store.dispatch(actions.mergeCustomers(2, 3))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
