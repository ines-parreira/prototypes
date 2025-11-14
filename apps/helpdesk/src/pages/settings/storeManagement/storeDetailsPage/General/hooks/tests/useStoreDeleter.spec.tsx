import { renderHook } from '@repo/testing'
import { AxiosError } from 'axios'
import { useHistory } from 'react-router-dom'

import { useDeleteIntegration } from '@gorgias/helpdesk-queries'

import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import useStoreDeleter from '../useStoreDeleter'

jest.mock('state/notifications/actions')

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
    default: () => mockDispatch,
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

    it('should handle successful integration deletion', () => {
        renderHook(() => useStoreDeleter())
        const mutationOptions = (useDeleteIntegration as jest.Mock).mock
            .calls[0][0]

        mutationOptions.mutation.onSuccess()

        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                status: NotificationStatus.Success,
            }),
        )

        expect(mockPush).toHaveBeenCalledWith('/app/settings/store-management')
    })

    it('should handle integration deletion error with custom message', () => {
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

        mutationOptions.mutation.onError(mockError)

        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: mockErrorMessage,
                status: NotificationStatus.Error,
            }),
        )
    })

    it('should handle integration deletion error with default message', () => {
        renderHook(() => useStoreDeleter())
        const mutationOptions = (useDeleteIntegration as jest.Mock).mock
            .calls[0][0]

        const mockError: AxiosError = {
            isAxiosError: true,
            response: {
                data: {},
            },
        } as AxiosError

        mutationOptions.mutation.onError(mockError)
        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Failed to delete integration',
                status: NotificationStatus.Error,
            }),
        )

        expect(mockPush).not.toHaveBeenCalled()
    })
})
