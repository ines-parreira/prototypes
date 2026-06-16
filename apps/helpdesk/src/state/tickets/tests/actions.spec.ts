import client from '@repo/api-resources'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toast } from '@gorgias/axiom'

import { JobType } from '../../../models/job/types'
import type { RootState, StoreDispatch } from '../../types'
import * as actions from '../actions'
import { initialState } from '../reducers'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('tickets actions', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        mockServer.reset()
        jest.clearAllMocks()
    })

    beforeEach(() => {
        store = mockStore({ ticket: initialState })
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
            const jobPartialParams = { exampleKey: 'exampleValue' }

            await store.dispatch(
                actions.createJob(
                    idsList,
                    JobType.ApplyMacro,
                    jobPartialParams,
                ),
            )
            expect(mockServer.history).toMatchSnapshot()
        })

        it('should show an error toast when the jobs api fails', async () => {
            const toastErrorSpy = jest.spyOn(toast, 'error')
            mockServer.onPost('/api/jobs/').reply(500)

            await expect(
                store.dispatch(
                    actions.createJob(fromJS([1]), JobType.ApplyMacro, {}),
                ),
            ).rejects.toEqual(new Error('Request failed with status code 500'))

            expect(toastErrorSpy).toHaveBeenCalledWith(
                'Failed to apply action on tickets. Please try again.',
            )
        })
    })
})
