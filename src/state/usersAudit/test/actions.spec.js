import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as actions from '../actions'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('users audit actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({users: initialState})
        mockServer = new MockAdapter(axios)
    })

    it('fetch user audit', () => {
        mockServer.onGet('/api/users/audit/').reply(200, {data: [{id: 2}]})

        return store.dispatch(actions.fetchUsersAudit({}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch user audit bad request', () => {
        mockServer.onGet('/api/users/audit/').reply(400, {data: [{id: 2}]})

        return store.dispatch(actions.fetchUsersAudit({}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
