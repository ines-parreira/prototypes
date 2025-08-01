import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'

import { agents } from 'fixtures/agents'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    agentsKeys,
    useUpdateAgent as usePureUpdateAgent,
} from 'models/agents/queries'
import { UPDATE_AGENT_SUCCESS } from 'state/agents/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { handleError } from '../errorHandler'
import { useUpdateAgent } from '../useUpdateAgent'

const queryClient = mockQueryClient()

jest.mock('models/agents/queries')
const usePureUpdateAgentMock = assumeMock(usePureUpdateAgent)

jest.mock('../errorHandler')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useUpdateAgent', () => {
    const id = 1

    beforeEach(() => {
        usePureUpdateAgentMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate lists queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useUpdateAgent(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureUpdateAgentMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(agents[0]),
            [{ id, agent: agents[0] }],
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: agentsKeys.all(),
        })

        expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
            type: UPDATE_AGENT_SUCCESS,
            resp: agents[0],
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Team member updated',
            status: NotificationStatus.Success,
        })

        expect(mockedDispatch).toHaveBeenCalledTimes(2)
    })

    it('should call handleError on error', () => {
        renderHook(() => useUpdateAgent(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureUpdateAgentMock.mock.calls[0][0]?.onError!(
            myError,
            [{ id, agent: agents[0] }],
            undefined,
        )

        expect(handleError).toHaveBeenNthCalledWith(
            1,
            null,
            null,
            mockedDispatch,
            'Error while updating user',
        )
    })
})
