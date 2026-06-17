import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    agentsKeys,
    useDeleteAgent as usePureDeleteAgent,
} from 'models/agents/queries'
import { DELETE_AGENT_SUCCESS } from 'state/agents/constants'

import { handleError } from '../errorHandler'
import { useDeleteAgent } from '../useDeleteAgent'

jest.mock('models/agents/queries')
const usePureDeleteAgentMock = assumeMock(usePureDeleteAgent)

jest.mock('../errorHandler')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    useAppDispatch: () => mockedDispatch,
}))

describe('useDeleteAgent', () => {
    const id = 1
    const name = 'M. Love'

    beforeEach(() => {
        usePureDeleteAgentMock.mockClear()
    })

    it('shows success toast on success and invalidates list queries', async () => {
        const invalidateQueryMock = jest.spyOn(
            QueryClient.prototype,
            'invalidateQueries',
        )
        renderHook(() => useDeleteAgent(name))
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

        const toastEl = await screen.findByRole('status', {
            name: `${name} user has been deleted`,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')

        invalidateQueryMock.mockRestore()
    })

    it('should call handleError on error', () => {
        renderHook(() => useDeleteAgent(name))
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
        )
    })
})
