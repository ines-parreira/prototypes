import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { useMutation } from '@tanstack/react-query'

import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useUpgradeSalesSubscriptionMutation,
    useUpgradeSubscriptionMutation,
} from 'models/aiAgent/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useUpgradePlan } from '../hooks/useUpgradePlan'

jest.mock('@tanstack/react-query', () => ({
    __esModule: true,
    useMutation: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('models/aiAgent/queries', () => ({
    useUpgradeSalesSubscriptionMutation: jest.fn(),
    useUpgradeSubscriptionMutation: jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const useMutationMock = assumeMock(useMutation)
const useAppDispatchMock = assumeMock(useAppDispatch)
const useUpgradeSalesSubscriptionMutationMock = assumeMock(
    useUpgradeSalesSubscriptionMutation,
)
const useUpgradeSubscriptionMutationMock = assumeMock(
    useUpgradeSubscriptionMutation,
)
const notifyMock = assumeMock(notify)
const useFlagMock = assumeMock(useFlag)

describe('useUpgradePlan', () => {
    const mockDispatch = jest.fn()
    const mockMutate = jest.fn()
    const mockMutateAsync = jest.fn()
    const mockUpgradeSalesSubscriptionMutateAsync = jest.fn()
    const mockUpgradeSubscriptionMutateAsync = jest.fn()
    const mockReload = jest.fn()

    const mockMutationResult = {
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isLoading: false,
        error: null,
        isSuccess: false,
        isError: false,
    }

    const mockUpgradeSalesSubscriptionResult = {
        mutateAsync: mockUpgradeSalesSubscriptionMutateAsync,
        mutate: jest.fn(),
        isLoading: false,
        error: null,
        isSuccess: false,
        isError: false,
    }

    const mockUpgradeSubscriptionResult = {
        mutateAsync: mockUpgradeSubscriptionMutateAsync,
        mutate: jest.fn(),
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
        useUpgradeSalesSubscriptionMutationMock.mockReturnValue(
            mockUpgradeSalesSubscriptionResult as any,
        )
        useUpgradeSubscriptionMutationMock.mockReturnValue(
            mockUpgradeSubscriptionResult as any,
        )
        useFlagMock.mockReturnValue(false)
        useMutationMock.mockReturnValue({
            ...mockMutationResult,
            data: undefined,
            isIdle: false,
            status: 'idle',
            reset: jest.fn(),
            variables: undefined,
            context: undefined,
        } as any)

        mockUpgradeSalesSubscriptionMutateAsync.mockResolvedValue(undefined)
        mockUpgradeSubscriptionMutateAsync.mockResolvedValue(undefined)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should initialize mutation with correct configuration', () => {
        renderHook(() => useUpgradePlan())

        expect(useMutationMock).toHaveBeenCalledWith({
            mutationFn: expect.any(Function),
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        })
    })

    it('should return correct properties from mutation result', () => {
        const { result } = renderHook(() => useUpgradePlan())

        expect(result.current).toEqual({
            upgradePlan: mockMutate,
            upgradePlanAsync: mockMutateAsync,
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        })
    })

    describe('mutationFn', () => {
        it('should call upgradeSalesSubscriptionMutation when feature flag is disabled', async () => {
            useFlagMock.mockReturnValue(false)

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn
            await mutationFn()

            expect(
                mockUpgradeSalesSubscriptionMutateAsync,
            ).toHaveBeenCalledWith([])
            expect(mockUpgradeSubscriptionMutateAsync).not.toHaveBeenCalled()
        })

        it('should call upgradeSubscriptionMutation when feature flag is enabled', async () => {
            useFlagMock.mockReturnValue(true)

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn
            await mutationFn()

            expect(mockUpgradeSubscriptionMutateAsync).toHaveBeenCalledWith([])
            expect(
                mockUpgradeSalesSubscriptionMutateAsync,
            ).not.toHaveBeenCalled()
        })

        it('should handle upgradeSalesSubscription errors', async () => {
            const error = new Error('Subscription upgrade failed')
            mockUpgradeSalesSubscriptionMutateAsync.mockRejectedValue(error)
            useFlagMock.mockReturnValue(false)

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn

            await expect(mutationFn()).rejects.toThrow(
                'Subscription upgrade failed',
            )
        })

        it('should handle upgradeSubscription errors', async () => {
            const error = new Error('Upgrade subscription failed')
            mockUpgradeSubscriptionMutateAsync.mockRejectedValue(error)
            useFlagMock.mockReturnValue(true)

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn

            await expect(mutationFn()).rejects.toThrow(
                'Upgrade subscription failed',
            )
        })
    })

    describe('onSuccess callback', () => {
        it('should dispatch success notification', () => {
            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
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

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const onSuccess = mutationOptions.onSuccess
            onSuccess()

            expect(mockReload).toHaveBeenCalledTimes(1)
        })
    })

    describe('onError callback', () => {
        it('should dispatch error notification', () => {
            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
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

    describe('feature flag detection', () => {
        it('should check the correct feature flag', () => {
            useFlagMock.mockReturnValue(false)

            renderHook(() => useUpgradePlan())

            expect(useFlagMock).toHaveBeenCalledWith(
                FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
            )
        })

        it('should use the feature flag value correctly', () => {
            useFlagMock.mockReturnValue(true)

            renderHook(() => useUpgradePlan())

            expect(useFlagMock).toHaveBeenCalledTimes(1)
            expect(useFlagMock).toHaveBeenCalledWith(
                FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
            )
        })
    })

    describe('integration with mutation states', () => {
        it('should reflect loading state from mutation', () => {
            useMutationMock.mockReturnValue({
                ...mockMutationResult,
                isLoading: true,
                data: undefined,
                isIdle: false,
                status: 'loading',
                reset: jest.fn(),
                variables: undefined,
                context: undefined,
            } as any)

            const { result } = renderHook(() => useUpgradePlan())

            expect(result.current.isLoading).toBe(true)
        })

        it('should reflect error state from mutation', () => {
            const error = new Error('Network error')
            useMutationMock.mockReturnValue({
                ...mockMutationResult,
                isError: true,
                error,
                data: undefined,
                isIdle: false,
                status: 'error',
                reset: jest.fn(),
                variables: undefined,
                context: undefined,
            } as any)

            const { result } = renderHook(() => useUpgradePlan())

            expect(result.current.isError).toBe(true)
            expect(result.current.error).toBe(error)
        })

        it('should reflect success state from mutation', () => {
            useMutationMock.mockReturnValue({
                ...mockMutationResult,
                isSuccess: true,
                data: undefined,
                isIdle: false,
                status: 'success',
                reset: jest.fn(),
                variables: undefined,
                context: undefined,
            } as any)

            const { result } = renderHook(() => useUpgradePlan())

            expect(result.current.isSuccess).toBe(true)
        })
    })

    describe('when isExpandingTrialExperienceEnabled is true', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should call upgradeSubscriptionMutation', async () => {
            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn
            await mutationFn()

            expect(mockUpgradeSubscriptionMutateAsync).toHaveBeenCalledWith([])
            expect(
                mockUpgradeSalesSubscriptionMutateAsync,
            ).not.toHaveBeenCalled()
        })

        it('should handle upgradeSubscriptionMutation errors', async () => {
            const error = new Error('Subscription upgrade failed')
            mockUpgradeSubscriptionMutateAsync.mockRejectedValue(error)

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn

            await expect(mutationFn()).rejects.toThrow(
                'Subscription upgrade failed',
            )
        })

        it('should handle success callback correctly', () => {
            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const onSuccess = mutationOptions.onSuccess
            onSuccess()

            expect(mockDispatch).toHaveBeenCalledWith(
                notifyMock({
                    message: 'Your plan has been upgraded!',
                    status: NotificationStatus.Success,
                }),
            )
            expect(mockReload).toHaveBeenCalledTimes(1)
        })

        it('should handle error callback correctly', () => {
            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
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
})
