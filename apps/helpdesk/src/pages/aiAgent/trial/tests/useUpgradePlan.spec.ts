import { assumeMock, renderHook } from '@repo/testing'

import useAppDispatch from 'hooks/useAppDispatch'
import { useUpgradeAiAgentSubscriptionGeneration6Plan } from 'models/billing/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useUpgradePlan } from '../hooks/useUpgradePlan'

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('models/billing/queries', () => ({
    useUpgradeAiAgentSubscriptionGeneration6Plan: jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

const useAppDispatchMock = assumeMock(useAppDispatch)
const useUpgradeAiAgentSubscriptionGeneration6PlanMock = assumeMock(
    useUpgradeAiAgentSubscriptionGeneration6Plan,
)
const notifyMock = assumeMock(notify)

describe('useUpgradePlan', () => {
    const mockDispatch = jest.fn()
    const mockMutate = jest.fn()
    const mockMutateAsync = jest.fn()
    const mockReload = jest.fn()

    const mockMutationResult = {
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isLoading: false,
        error: null,
        isSuccess: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()

        Object.defineProperty(window, 'location', {
            writable: true,
            value: {
                reload: mockReload,
            },
        })

        useAppDispatchMock.mockReturnValue(mockDispatch)
        useUpgradeAiAgentSubscriptionGeneration6PlanMock.mockReturnValue(
            mockMutationResult as any,
        )
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should call useUpgradeAiAgentSubscriptionGeneration6Plan with correct configuration', () => {
        renderHook(() => useUpgradePlan())

        expect(
            useUpgradeAiAgentSubscriptionGeneration6PlanMock,
        ).toHaveBeenCalledWith({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        })
    })

    it('should return correct properties from mutation result', () => {
        const { result } = renderHook(() => useUpgradePlan())

        expect(result.current).toMatchObject({
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        })
        expect(typeof result.current.upgradePlan).toBe('function')
        expect(typeof result.current.upgradePlanAsync).toBe('function')
    })

    it('should call mutate with empty array when upgradePlan is invoked', () => {
        const { result } = renderHook(() => useUpgradePlan())

        result.current.upgradePlan()

        expect(mockMutate).toHaveBeenCalledWith([])
        expect(mockMutate).toHaveBeenCalledTimes(1)
    })

    it('should call mutateAsync with empty array when upgradePlanAsync is invoked', () => {
        const { result } = renderHook(() => useUpgradePlan())

        result.current.upgradePlanAsync()

        expect(mockMutateAsync).toHaveBeenCalledWith([])
        expect(mockMutateAsync).toHaveBeenCalledTimes(1)
    })

    describe('onSuccess callback', () => {
        it('should dispatch success notification', () => {
            renderHook(() => useUpgradePlan())

            const mutationOptions =
                useUpgradeAiAgentSubscriptionGeneration6PlanMock.mock
                    .calls[0][0] as any
            const onSuccess = mutationOptions.onSuccess
            onSuccess()

            expect(mockDispatch).toHaveBeenCalledWith(
                notifyMock({
                    message: 'Your plan has been upgraded!',
                    status: NotificationStatus.Success,
                }),
            )
        })

        it('should reload the window', () => {
            renderHook(() => useUpgradePlan())

            const mutationOptions =
                useUpgradeAiAgentSubscriptionGeneration6PlanMock.mock
                    .calls[0][0] as any
            const onSuccess = mutationOptions.onSuccess
            onSuccess()

            expect(mockReload).toHaveBeenCalledTimes(1)
        })
    })

    describe('onError callback', () => {
        it('should dispatch error notification', () => {
            renderHook(() => useUpgradePlan())

            const mutationOptions =
                useUpgradeAiAgentSubscriptionGeneration6PlanMock.mock
                    .calls[0][0] as any
            const onError = mutationOptions.onError
            onError()

            expect(mockDispatch).toHaveBeenCalledWith(
                notifyMock({
                    message: 'Failed to upgrade plan. Please try again later.',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })

    describe('integration with mutation states', () => {
        it('should reflect loading state from mutation', () => {
            useUpgradeAiAgentSubscriptionGeneration6PlanMock.mockReturnValue({
                ...mockMutationResult,
                isLoading: true,
            } as any)

            const { result } = renderHook(() => useUpgradePlan())

            expect(result.current.isLoading).toBe(true)
        })

        it('should reflect error state from mutation', () => {
            const error = new Error('Network error')
            useUpgradeAiAgentSubscriptionGeneration6PlanMock.mockReturnValue({
                ...mockMutationResult,
                isError: true,
                error,
            } as any)

            const { result } = renderHook(() => useUpgradePlan())

            expect(result.current.isError).toBe(true)
            expect(result.current.error).toBe(error)
        })

        it('should reflect success state from mutation', () => {
            useUpgradeAiAgentSubscriptionGeneration6PlanMock.mockReturnValue({
                ...mockMutationResult,
                isSuccess: true,
            } as any)

            const { result } = renderHook(() => useUpgradePlan())

            expect(result.current.isSuccess).toBe(true)
        })
    })
})
