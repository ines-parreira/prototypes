import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    agentsKeys,
    useDeleteAgent as usePureDeleteAgent,
} from 'models/agents/queries'
import { DELETE_AGENT_SUCCESS } from 'state/agents/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { handleError } from '../errorHandler'
import { useDeleteAgent } from '../useDeleteAgent'

const queryClient = mockQueryClient()

jest.mock('models/agents/queries')
const usePureDeleteAgentMock = assumeMock(usePureDeleteAgent)

jest.mock('../errorHandler')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useDeleteAgent', () => {
    const id = 1
    const name = 'M. Love'

    beforeEach(() => {
        usePureDeleteAgentMock.mockClear()
    })

    it('should accept a name param and dispatch success notification on success and invalidate lists queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useDeleteAgent(name), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureDeleteAgentMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(undefined),
            [id],
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: agentsKeys.lists(),
        })

        expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
            type: DELETE_AGENT_SUCCESS,
            id,
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: `${name} user has been deleted`,
            status: NotificationStatus.Success,
        })

        expect(mockedDispatch).toHaveBeenCalledTimes(2)
    })

    it('should call handleError on error', () => {
        renderHook(() => useDeleteAgent(name), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureDeleteAgentMock.mock.calls[0][0]?.onError!(
            myError,
            [0],
            undefined,
        )

        expect(handleError).toHaveBeenNthCalledWith(
            1,
            myError,
            `Failed to delete ${name} user`,
            mockedDispatch,
        )
    })
})
