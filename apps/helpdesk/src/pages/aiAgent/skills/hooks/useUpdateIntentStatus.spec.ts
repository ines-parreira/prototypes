import { renderHook } from '@repo/testing'
import { useQueryClient } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import {
    helpCenterKeys,
    useUpdateIntentStatus as useUpdateIntentStatusMutation,
} from 'models/helpCenter/queries'

import { useUpdateIntentStatus } from './useUpdateIntentStatus'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(),
}))
jest.mock('models/helpCenter/queries', () => ({
    helpCenterKeys: {
        intents: jest.fn((id: number) => ['help-center', id, 'intents']),
    },
    useUpdateIntentStatus: jest.fn(),
}))

const mockMutateAsync = jest.fn()
const mockInvalidateQueries = jest.fn()

const mockUseUpdateIntentStatusMutation =
    useUpdateIntentStatusMutation as jest.Mock
const mockUseQueryClient = useQueryClient as jest.Mock

describe('useUpdateIntentStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockMutateAsync.mockResolvedValue(undefined)
        mockUseUpdateIntentStatusMutation.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
        })
        mockUseQueryClient.mockReturnValue({
            invalidateQueries: mockInvalidateQueries,
        })
    })

    const helpCenterId = 42

    it('should call mutateAsync with not_linked when updateIntentStatus is called with NotLinked', async () => {
        const { result } = renderHook(() => useUpdateIntentStatus(helpCenterId))

        await result.current.updateIntentStatus('order::status', 'not_linked')

        expect(mockMutateAsync).toHaveBeenCalledWith([
            undefined,
            { help_center_id: helpCenterId, intent: 'order::status' },
            { status: 'not_linked' },
        ])
    })

    it('should call mutateAsync with handover when updateIntentStatus is called with Handover', async () => {
        const { result } = renderHook(() => useUpdateIntentStatus(helpCenterId))

        await result.current.updateIntentStatus('order::cancel', 'handover')

        expect(mockMutateAsync).toHaveBeenCalledWith([
            undefined,
            { help_center_id: helpCenterId, intent: 'order::cancel' },
            { status: 'handover' },
        ])
    })

    it('should invalidate the intents query after a successful update', async () => {
        const { result } = renderHook(() => useUpdateIntentStatus(helpCenterId))

        await result.current.updateIntentStatus('order::status', 'not_linked')

        await waitFor(() => {
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: helpCenterKeys.intents(helpCenterId),
            })
        })
    })

    it('should expose isLoading from the mutation', () => {
        mockUseUpdateIntentStatusMutation.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: true,
        })

        const { result } = renderHook(() => useUpdateIntentStatus(helpCenterId))

        expect(result.current.isLoading).toBe(true)
    })
})
