import { useUpdateIntegration } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import { renderHook } from 'utils/testing/renderHook'

import useStoreUpdater from '../useStoreUpdater'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useUpdateIntegration: jest.fn(),
}))

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

describe('useStoreUpdater', () => {
    const mockRefetchStore = jest.fn()
    const mockSuccess = jest.fn()
    const mockError = jest.fn()
    const mockMutate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useNotify as jest.Mock).mockReturnValue({
            success: mockSuccess,
            error: mockError,
        })
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

    it('calls success notification and refetches store on successful update', () => {
        renderHook(() => useStoreUpdater(mockRefetchStore))

        const onSuccess = (useUpdateIntegration as jest.Mock).mock.calls[0][0]
            .mutation.onSuccess

        onSuccess()

        expect(mockSuccess).toHaveBeenCalledWith(
            'Integration successfully updated',
        )
        expect(mockRefetchStore).toHaveBeenCalled()
    })

    it('calls error notification on failed update', () => {
        renderHook(() => useStoreUpdater(mockRefetchStore))

        const onError = (useUpdateIntegration as jest.Mock).mock.calls[0][0]
            .mutation.onError

        onError()

        expect(mockError).toHaveBeenCalledWith('Failed to update connection')
    })
})
