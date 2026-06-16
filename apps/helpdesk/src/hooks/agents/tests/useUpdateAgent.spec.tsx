import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { agents } from 'fixtures/agents'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    agentsKeys,
    useUpdateAgent as usePureUpdateAgent,
} from 'models/agents/queries'
import { UPDATE_AGENT_SUCCESS } from 'state/agents/constants'

import { handleError } from '../errorHandler'
import { useUpdateAgent } from '../useUpdateAgent'

jest.mock('models/agents/queries')
const usePureUpdateAgentMock = assumeMock(usePureUpdateAgent)

jest.mock('../errorHandler')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    useAppDispatch: () => mockedDispatch,
}))

describe('useUpdateAgent', () => {
    const id = 1

    beforeEach(() => {
        usePureUpdateAgentMock.mockClear()
    })

    it('shows success toast on success and invalidates list queries', async () => {
        const invalidateQueryMock = jest.spyOn(
            QueryClient.prototype,
            'invalidateQueries',
        )
        renderHook(() => useUpdateAgent())
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

        const toastEl = await screen.findByRole('status', {
            name: 'Team member updated',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')

        invalidateQueryMock.mockRestore()
    })

    it('should call handleError on error', () => {
        renderHook(() => useUpdateAgent())
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
            'Error while updating user',
        )
    })
})
