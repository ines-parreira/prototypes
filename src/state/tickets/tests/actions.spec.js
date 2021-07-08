import axios from 'axios'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions.ts'
import {initialState} from '../reducers.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})
jest.mock('reapop', () => {
    const reapop = require.requireActual('reapop')

    return {
        ...reapop,
        updateNotification: jest.fn(() => (args) => args),
    }
})

describe('tickets actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        mockServer = new MockAdapter(axios)
    })

    beforeEach(() => {
        store = mockStore({ticket: initialState})
    })

    describe('updateCursor()', () => {
        it('should update cursor', () => {
            store.dispatch(actions.updateCursor('new'))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('bulkUpdate()', () => {
        it('should call the jobs api with the given parameters', async () => {
            mockServer.onAny().reply(200)

            const idsList = fromJS([1, 2, 3, 4])
            const jobType = 'jobTypeExample'
            const jobPartialParams = {exampleKey: 'exampleValue'}

            await store.dispatch(
                actions.createJob(idsList, jobType, jobPartialParams)
            )
            expect(mockServer.history).toMatchSnapshot()
        })
    })
})
