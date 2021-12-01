import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import client from '../../../models/api/resources'
import {JobType} from '../../../models/job/types'
import {RootState, StoreDispatch} from '../../types'
import * as actions from '../actions'
import {initialState} from '../reducers'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: Record<string, unknown>) => args),
    }
})
jest.mock('reapop', () => {
    const reapop: Record<string, unknown> = jest.requireActual('reapop')
    return {
        ...reapop,
        updateNotification: jest.fn(
            () => (args: Record<string, unknown>) => args
        ),
    }
})

describe('tickets actions', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        mockServer.reset()
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
            const jobPartialParams = {exampleKey: 'exampleValue'}

            await store.dispatch(
                actions.createJob(idsList, JobType.ApplyMacro, jobPartialParams)
            )
            expect(mockServer.history).toMatchSnapshot()
        })
    })
})
