import { renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import type { AxiosError } from 'axios'
import { useHistory } from 'react-router-dom'

import { toast } from '@gorgias/axiom'
import { useDeleteIntegration } from '@gorgias/helpdesk-queries'

import { useStoreDeleter } from '../useStoreDeleter'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    useDeleteIntegration: jest.fn(),
}))

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    useAppDispatch: () => mockDispatch,
}))

jest.mock('pages/settings/storeManagement/StoreManagementProvider', () => ({
    useStoreManagementState: () => ({
        refetchIntegrations: jest.fn(),
        refetchMapping: jest.fn(),
    }),
}))

describe('useStoreDeleter', () => {
    const mockPush = jest.fn()
    const mockMutate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useHistory as jest.Mock).mockReturnValue({ push: mockPush })
        ;(useDeleteIntegration as jest.Mock).mockReturnValue({
            mutate: mockMutate,
            isLoading: false,
        })
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should handle successful integration deletion', async () => {
        renderHook(() => useStoreDeleter())
        const mutationOptions = (useDeleteIntegration as jest.Mock).mock
            .calls[0][0]

        act(() => {
            mutationOptions.mutation.onSuccess()
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Store is successfully deleted. It may take a minute for all channels and features to disconnect.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })

        expect(mockPush).toHaveBeenCalledWith('/app/settings/store-management')
    })

    it('should handle integration deletion error with custom message', async () => {
        renderHook(() => useStoreDeleter())
        const mutationOptions = (useDeleteIntegration as jest.Mock).mock
            .calls[0][0]

        const mockErrorMessage = 'Custom error message'
        const mockError: AxiosError = {
            response: {
                data: {
                    error: {
                        msg: mockErrorMessage,
                    },
                },
            },
        } as AxiosError

        act(() => {
            mutationOptions.mutation.onError(mockError)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to delete integration',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should handle integration deletion error with default message', async () => {
        renderHook(() => useStoreDeleter())
        const mutationOptions = (useDeleteIntegration as jest.Mock).mock
            .calls[0][0]

        const mockError: AxiosError = {
            isAxiosError: true,
            response: {
                data: {},
            },
        } as AxiosError

        act(() => {
            mutationOptions.mutation.onError(mockError)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to delete integration',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })

        expect(mockPush).not.toHaveBeenCalled()
    })
})
