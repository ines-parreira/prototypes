import * as immutableMatchers from 'jest-immutable-matchers'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.addMatchers(immutableMatchers)

describe('auths actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({auths: fromJS({})})
        mockServer = new MockAdapter(axios)
    })

    it("should successfully fetch user's auths and store the result", () => {
        mockServer.onGet('/api/users/0/auths/').reply(200, {data: [{id: 1}]})

        return store
            .dispatch(actions.fetchCurrentAuths())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it("shouldn't store anything if there was any errors when fetching user's auths", () => {
        mockServer.onGet('/api/users/0/auths/').reply(403, 'Forbidden.')

        return store
            .dispatch(actions.fetchCurrentAuths())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it("should successfully reset user's API key and store the result", () => {
        mockServer
            .onGet('/api/users/0/reset_key/')
            .reply(201, {data: [{id: 1}]})

        return store
            .dispatch(actions.fetchCurrentAuths())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it("shouldn't store anything if there was any errors when reseting user's API key", () => {
        mockServer.onGet('/api/users/0/auths/').reply(403, 'Forbidden.')

        return store
            .dispatch(actions.fetchCurrentAuths())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
