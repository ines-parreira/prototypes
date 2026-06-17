import { assumeMock, renderHook } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { agents } from 'fixtures/agents'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    agentsKeys,
    useCreateAgent as usePureCreateAgent,
} from 'models/agents/queries'
import { CREATE_AGENT_SUCCESS } from 'state/agents/constants'

import { handleError } from '../errorHandler'
import { useCreateAgent } from '../useCreateAgent'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(),
}))
jest.mock('models/agents/queries')
const usePureCreateAgentMock = assumeMock(usePureCreateAgent)
jest.mock('../errorHandler')
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    useAppDispatch: () => mockedDispatch,
}))
const useQueryClientMock = assumeMock(useQueryClient)

describe('useCreateAgent', () => {
    const invalidateQueriesMock = jest.fn()
    beforeEach(() => {
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    it('should show success toast on success and invalidate lists queries', async () => {
        renderHook(() => useCreateAgent())

        usePureCreateAgentMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(agents[0]),
            [agents[0]],
            undefined,
        )

        expect(useQueryClient().invalidateQueries).toHaveBeenLastCalledWith({
            queryKey: agentsKeys.all(),
        })

        expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
            type: CREATE_AGENT_SUCCESS,
            resp: agents[0],
        })

        const toastEl = await screen.findByRole('status', {
            name: `Team member created. We've sent login instructions to ${agents[0].email}.`,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('should call handleError on error', () => {
        renderHook(() => useCreateAgent())
        const myError = {}
        usePureCreateAgentMock.mock.calls[0][0]?.onError!(
            myError,
            [agents[0]],
            'Failed to create team member',
        )

        expect(handleError).toHaveBeenNthCalledWith(
            1,
            null,
            null,
            'Error while creating user',
        )
    })
})
