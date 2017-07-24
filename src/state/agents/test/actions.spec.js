import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as actions from '../actions'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('agents', () => {
    describe('actions', () => {
        let store
        let mockServer

        beforeEach(() => {
            store = mockStore(initialState)
            mockServer = new MockAdapter(axios)
        })

        it('dispatch invite OK', () => {
            mockServer
                .onPost('/api/users/1/invite/')
                .reply(200)

            return store.dispatch(actions.inviteAgent(1))
                .then(() => {
                    expect(store.getActions()[0]).toHaveProperty('message', 'Team member invited')
                })
        })
    })
})
