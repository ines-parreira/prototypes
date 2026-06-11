import { renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useUpdateIntegration } from '@gorgias/helpdesk-queries'

import { useStoreUpdater } from '../useStoreUpdater'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useUpdateIntegration: jest.fn(),
}))

describe('useStoreUpdater', () => {
    const mockRefetchStore = jest.fn()
    const mockMutate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useUpdateIntegration as jest.Mock).mockReturnValue({
            mutate: mockMutate,
            isLoading: false,
        })
    })

    it('initializes with correct mutation options', () => {
        renderHook(() => useStoreUpdater(mockRefetchStore))

        expect(useUpdateIntegration).toHaveBeenCalledWith({
            mutation: {
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            },
        })
    })

    it('calls success notification and refetches store on successful update', async () => {
        renderHook(() => useStoreUpdater(mockRefetchStore))

        const onSuccess = (useUpdateIntegration as jest.Mock).mock.calls[0][0]
            .mutation.onSuccess

        onSuccess()

        const toastEl = await screen.findByRole('status', {
            name: 'Integration successfully updated',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
        expect(mockRefetchStore).toHaveBeenCalled()
    })

    it('calls error notification on failed update', async () => {
        renderHook(() => useStoreUpdater(mockRefetchStore))

        const onError = (useUpdateIntegration as jest.Mock).mock.calls[0][0]
            .mutation.onError

        onError()

        const toastEl = await screen.findByRole('status', {
            name: 'Failed to update connection',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
