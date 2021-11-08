import * as immutableMatchers from 'jest-immutable-matchers'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {fromJS, Map} from 'immutable'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions'
import {initialState} from '../reducers'
import {StoreDispatch} from '../../types'
import {UserRole} from '../../../config/types/user'
import client from '../../../models/api/resources'

type MockedRootState = {
    agents: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

jest.addMatchers(immutableMatchers)

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(() => <T>(args: T): T => args),
    }
})

describe('agents actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({agents: initialState})
        mockServer = new MockAdapter(client)
    })

    it('create agent', () => {
        const data = {
            name: 'Alex',
            email: 'alex@gorgias.io',
            roles: [{name: UserRole.Agent}],
        }

        mockServer.onPost('/api/users/').reply(200, {data})

        return store
            .dispatch(actions.createAgent(data))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('deleteAgent()', () => {
        it('delete agent', () => {
            mockServer.onDelete('/api/users/1/').reply(200)

            return store
                .dispatch(actions.deleteAgent(1))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('display error', () => {
            mockServer.onDelete('/api/users/1/').reply(400, {
                error: {
                    msg:
                        'Cannot delete user because it is used in the following places:',
                    data: {Rules: ['[Generic] Auto Reply: Auto-responder']},
                },
            })

            return store
                .dispatch(actions.deleteAgent(1))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('fetchAgent', () => {
        it('should return the agent on success', () => {
            const user = {data: {id: 2}}
            mockServer.onGet('/api/users/2/').reply(200, user)

            return store.dispatch(actions.fetchAgent(2)).then((resp) => {
                expect(resp).toEqualImmutable(fromJS(user))
            })
        })

        it('should return undefined on failure', async () => {
            mockServer.onGet('/api/users/2/').reply(404)
            const res = await store.dispatch(actions.fetchAgent(2))
            expect(res).toBeUndefined()
        })
    })

    it('fetch agents', () => {
        mockServer.onGet('/api/users/').reply(200, {data: [{id: 1}]})

        return store
            .dispatch(actions.fetchPagination())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('invite agent', () => {
        mockServer.onPost('/api/users/2/invite').reply(200)

        return store
            .dispatch(actions.inviteAgent(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('update agent', () => {
        const data = {
            id: 2,
            name: 'Alex',
            email: 'alex@gorgias.io',
            roles: [{name: UserRole.Agent}],
        }

        mockServer.onPut('/api/users/2/').reply(200, {data})

        return store
            .dispatch(actions.updateAgent(2, data))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
