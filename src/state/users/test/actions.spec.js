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
        notify: jest.fn(() => (message) => () => message),
    }
})

describe('users actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({users: initialState})
        mockServer = new MockAdapter(axios)
    })

    it('fetch users', () => {
        mockServer
            .onGet('/api/users/')
            .reply(200, {
                data: [{id: 1}]
            })

        store
            .dispatch(actions.fetchUsers())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch user', () => {
        mockServer
            .onGet('/api/users/2/')
            .reply(200, {
                data: {id: 2}
            })

        store
            .dispatch(actions.fetchUser(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch current user', () => {
        mockServer
            .onGet('/api/users/0/')
            .reply(200, {
                data: {id: 12}
            })

        store
            .dispatch(actions.fetchUser(0))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('create user', () => {
        const userData = {
            name: 'Mario',
            email: 'mario@nintendo.com',
            role: 'agent'
        }

        mockServer
            .onPost('/api/users/')
            .reply(200, {
                data: userData
            })

        store
            .dispatch(actions.submitUser(userData))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('update user', () => {
        const userData = {
            id: 2,
            name: 'Mario',
            email: 'mario@nintendo.com',
            role: 'agent'
        }

        mockServer
            .onPut('/api/users/2/')
            .reply(200, {
                data: userData
            })

        store
            .dispatch(actions.submitUser(userData, userData.id))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('delete user', () => {
        mockServer
            .onDelete('/api/users/2/')
            .reply(200)

        store
            .dispatch(actions.deleteUser(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch user history', () => {
        mockServer
            .onGet('/api/users/2/tickets/?type=requested')
            .reply(200, {
                data: [{id: 1}]
            })

        store
            .dispatch(actions.fetchUserHistory(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
            .then(() => {
                store.clearActions()

                store
                    .dispatch(actions.fetchUserHistory(2, {
                        successCondition: () => false,
                    }))
                    .then(() => expect(store.getActions()).toMatchSnapshot())
            })
    })

    it('merge users', () => {
        mockServer
            .onPut('/api/users/2/merge/3/')
            .reply(200, {
                data: [{id: 1}]
            })

        store
            .dispatch(actions.mergeUsers(2, 3))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
