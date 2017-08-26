import * as immutableMatchers from 'jest-immutable-matchers'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as actions from '../actions'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.addMatchers(immutableMatchers)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})

describe('agents actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({agents: initialState})
        mockServer = new MockAdapter(axios)
    })

    it('create agent', () => {
        const data = {
            name: 'Alex',
            email: 'alex@gorgias.io',
            role: 'agent'
        }

        mockServer.onPost('/api/users/').reply(200, {data})

        store.dispatch(actions.createAgent(data))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('delete agent', () => {
        mockServer.onDelete('/api/users/1/').reply(200)

        store.dispatch(actions.deleteAgent(1))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch agent', () => {
        const user = {data: {id: 2}}
        mockServer.onGet('/api/users/2/').reply(200, user)

        return store.dispatch(actions.fetchAgent(2))
            .then((resp) => {
                expect(resp).toEqualImmutable(fromJS(user))
            })
    })

    it('fetch agents', () => {
        mockServer.onGet(/\/api\/users\/.+$/).reply(200, {data: [{id: 1}]})

        return store.dispatch(actions.fetchPagination())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('invite agent', () => {
        mockServer.onPost('/api/users/2/invite').reply(200)

        return store.dispatch(actions.inviteAgent(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('update agent', () => {
        const data = {
            id: 2,
            name: 'Alex',
            email: 'alex@gorgias.io',
            role: 'agent'
        }

        mockServer.onPut('/api/users/2/').reply(200, {data})

        return store.dispatch(actions.updateAgent(2, data))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
