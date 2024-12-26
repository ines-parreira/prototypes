import {useQueryClient} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {
    getWelcomePageAcknowledgedKey,
    useCreateWelcomePageAcknowledged,
} from 'models/aiAgent/queries'

import {useWelcomePageAcknowledgedMutation} from '../useWelcomePageAcknowledgedMutation'

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
}))

jest.mock('models/aiAgent/queries', () => ({
    getWelcomePageAcknowledgedKey: jest.fn(),
    useCreateWelcomePageAcknowledged: jest.fn(),
}))

describe('useWelcomePageAcknowledgedMutation', () => {
    const shopName = 'test-shop'

    const queryClientMock = {
        invalidateQueries: jest.fn(),
    }

    const createWelcomePageAcknowledgedMock = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return isLoading and createWelcomePageAcknowledged', () => {
        ;(useCreateWelcomePageAcknowledged as jest.Mock).mockReturnValue({
            isLoading: false,
            mutateAsync: createWelcomePageAcknowledgedMock,
        })

        const {result} = renderHook(() =>
            useWelcomePageAcknowledgedMutation({shopName})
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.createWelcomePageAcknowledged).toBe(
            createWelcomePageAcknowledgedMock
        )
    })

    it('should call invalidateQueries on success', () => {
        ;(useCreateWelcomePageAcknowledged as jest.Mock).mockReturnValue({
            isLoading: false,
            mutateAsync: createWelcomePageAcknowledgedMock,
        })

        const queryKey = 'mock-query-key'
        ;(getWelcomePageAcknowledgedKey as jest.Mock).mockReturnValue(queryKey)
        ;(useQueryClient as jest.Mock).mockReturnValue(queryClientMock)

        renderHook(() => useWelcomePageAcknowledgedMutation({shopName}))
        ;(
            (useCreateWelcomePageAcknowledged as jest.Mock).mock.calls[0] as [
                {onSuccess: () => void},
            ]
        )[0].onSuccess()

        expect(queryClientMock.invalidateQueries).toHaveBeenCalledWith({
            queryKey: 'mock-query-key',
        })
    })

    it('should handle the loading state correctly', () => {
        ;(useCreateWelcomePageAcknowledged as jest.Mock).mockReturnValue({
            isLoading: true,
            mutateAsync: createWelcomePageAcknowledgedMock,
        })

        const {result} = renderHook(() =>
            useWelcomePageAcknowledgedMutation({shopName})
        )

        expect(result.current.isLoading).toBe(true)
    })
})
