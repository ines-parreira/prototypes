import { history } from '@repo/routing'
import { assumeMock, renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'

import { useDeleteIntegration } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { DELETE_INTEGRATION_SUCCESS } from 'state/integrations/constants'

import useDeleteEmailIntegration from '../useDeleteEmailIntegration'

jest.mock('@gorgias/helpdesk-queries')
jest.mock('hooks/useAppDispatch')
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))
jest.mock('models/api/types')

const useDeleteIntegrationMock = assumeMock(useDeleteIntegration)
const useAppDispatchMock = assumeMock(useAppDispatch)
const isGorgiasApiErrorMock = assumeMock(isGorgiasApiError)

describe('useDeleteEmailIntegration', () => {
    const mockDispatch = jest.fn()
    const mockPush = jest.fn()

    beforeEach(() => {
        history.push = mockPush
        isGorgiasApiErrorMock.mockReturnValue(false)
        useAppDispatchMock.mockReturnValue(mockDispatch)
    })

    it('should handle successful deletion', () => {
        const integration = { id: 'test-id' }
        const mutate = jest.fn()
        useDeleteIntegrationMock.mockReturnValue({
            mutate,
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useDeleteEmailIntegration(integration as any),
        )

        act(() => {
            result.current.deleteIntegration()
        })

        expect(mutate).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-id',
            }),
        )

        act(() => {
            useDeleteIntegrationMock.mock.lastCall?.[0]?.mutation?.onSuccess?.(
                null as any,
                null as any,
                null as any,
            )
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: DELETE_INTEGRATION_SUCCESS,
            id: integration.id,
        })
        expect(mockPush).toHaveBeenCalledWith(expect.any(String))
    })

    it('should handle deletion error', async () => {
        const integration = { id: 'test-id' }
        const mutate = jest.fn()
        const errorResponse = {
            response: { data: { error: { msg: 'Error message' } } },
        }
        useDeleteIntegrationMock.mockReturnValue({
            mutate,
            isLoading: false,
        } as any)
        isGorgiasApiErrorMock.mockReturnValue(true)

        const { result } = renderHook(() =>
            useDeleteEmailIntegration(integration as any),
        )

        act(() => {
            result.current.deleteIntegration()
        })

        act(() => {
            useDeleteIntegrationMock.mock.lastCall?.[0]?.mutation?.onError?.(
                errorResponse,
                null as any,
                null as any,
            )
        })

        await waitFor(() => {
            const toast = screen.getByRole('status', { name: 'Error message' })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should handle deletion error with default message', async () => {
        const integration = { id: 'test-id' }
        const mutate = jest.fn()
        useDeleteIntegrationMock.mockReturnValue({
            mutate,
            isLoading: false,
        } as any)
        isGorgiasApiErrorMock.mockReturnValue(false)

        const { result } = renderHook(() =>
            useDeleteEmailIntegration(integration as any),
        )

        act(() => {
            result.current.deleteIntegration()
        })

        act(() => {
            useDeleteIntegrationMock.mock.lastCall?.[0]?.mutation?.onError?.(
                null as any,
                null as any,
                null as any,
            )
        })

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Failed to delete integration',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
