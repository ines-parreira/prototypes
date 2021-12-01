import * as immutableMatchers from 'jest-immutable-matchers'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import client from '../../../models/api/resources'
import {initialState} from '../reducers'
import {RootState, StoreDispatch} from '../../types'
import * as actions from '../actions'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.addMatchers(immutableMatchers)

describe('auths actions', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        store = mockStore({auths: initialState})
        mockServer.reset()
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
