import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions'
import {requestsInitial} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => ({
    notify: jest.fn(() => (args) => args),
}))

describe('requests actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({requests: requestsInitial})
        mockServer = new MockAdapter(axios)
    })

    describe('fetchRequests', () => {
        it('success actions', () => {
            mockServer.onGet('/api/requests/').reply(200, {data: ['refund']})
            return store.dispatch(actions.fetchRequests(2))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('update', () => {
        mockServer.onPut('/api/requests/1/').reply(200, {id: 1})
        return store.dispatch(actions.updateRequest(1, {name: 'a'}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('create', () => {
        mockServer.onPost('/api/requests/').reply(201, {id: 1})
        return store.dispatch(actions.createRequest({id: 1}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('delete', () => {
        mockServer.onDelete('/api/requests/1/').reply(200)
        return store.dispatch(actions.deleteRequest(1))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('bulkDelete', () => {
        mockServer.onDelete('/api/requests/').reply(204)
        return store.dispatch(actions.bulkDeleteRequest([1, 2]))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
