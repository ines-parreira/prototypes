import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import client from '../../../models/api/resources'
import {RootState, StoreDispatch} from '../../types'
import * as actions from '../actions'
import {initialState} from '../reducers'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('users audit actions', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        store = mockStore({usersAudit: initialState})
        mockServer.reset()
    })

    it('fetch user audit', () => {
        mockServer.onGet('/api/users/audit/').reply(200, {data: [{id: 2}]})

        return store
            .dispatch(actions.fetchUsersAudit({}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch user audit bad request', () => {
        mockServer.onGet('/api/users/audit/').reply(400, {data: [{id: 2}]})

        return store
            .dispatch(actions.fetchUsersAudit({}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
