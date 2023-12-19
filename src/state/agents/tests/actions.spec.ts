import * as immutableMatchers from 'jest-immutable-matchers'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {Map} from 'immutable'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions'
import {initialState} from '../reducers'
import {StoreDispatch} from '../../types'
import client from '../../../models/api/resources'

type MockedRootState = {
    agents: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(
            () =>
                <T>(args: T): T =>
                    args
        ),
    }
})

describe('agents actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        expect.extend(immutableMatchers)
        store = mockStore({agents: initialState})
        mockServer = new MockAdapter(client)
    })

    describe('deleteAgent()', () => {
        it('delete agent', () => {
            mockServer.onDelete('/api/users/1/').reply(200)

            return store
                .dispatch(actions.deleteAgent(1))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })
})
