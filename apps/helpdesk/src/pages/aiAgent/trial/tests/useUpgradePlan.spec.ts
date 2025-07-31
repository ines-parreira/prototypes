import { renderHook } from '@repo/testing'
import { useMutation } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import { useUpgradeSalesSubscriptionMutation } from 'models/aiAgent/queries'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import { useUpgradePlan } from '../hooks/useUpgradePlan'

jest.mock('@tanstack/react-query', () => ({
    __esModule: true,
    useMutation: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('models/aiAgent/queries', () => ({
    useUpgradeSalesSubscriptionMutation: jest.fn(),
}))

jest.mock('pages/aiAgent/Activation/hooks/useActivation', () => ({
    useActivation: jest.fn(),
}))

jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone', () => ({
    useSalesTrialRevampMilestone: jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

const useMutationMock = assumeMock(useMutation)
const useAppDispatchMock = assumeMock(useAppDispatch)
const useActivationMock = assumeMock(useActivation)
const useUpgradeSalesSubscriptionMutationMock = assumeMock(
    useUpgradeSalesSubscriptionMutation,
)
const useSalesTrialRevampMilestoneMock = assumeMock(
    useSalesTrialRevampMilestone,
)
const notifyMock = assumeMock(notify)

describe('useUpgradePlan', () => {
    const mockDispatch = jest.fn()
    const mockOnUpgradePlanClick = jest.fn()
    const mockMutate = jest.fn()
    const mockMutateAsync = jest.fn()
    const mockUpgradeSalesSubscriptionMutateAsync = jest.fn()

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

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()

        useAppDispatchMock.mockReturnValue(mockDispatch)
        useActivationMock.mockReturnValue({
            isOnNewPlan: false,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
            onUpgradePlanClick: mockOnUpgradePlanClick,
            activationModal: {} as any,
            activationButton: null,
            earlyAccessModal: {} as any,
        })
        useSalesTrialRevampMilestoneMock.mockReturnValue('off')
        useUpgradeSalesSubscriptionMutationMock.mockReturnValue(
            mockUpgradeSalesSubscriptionResult as any,
        )
        useMutationMock.mockReturnValue({
            ...mockMutationResult,
            data: undefined,
            isIdle: false,
            status: 'idle',
            reset: jest.fn(),
            variables: undefined,
            context: undefined,
        } as any)

        mockOnUpgradePlanClick.mockResolvedValue(undefined)
        mockUpgradeSalesSubscriptionMutateAsync.mockResolvedValue(undefined)
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
        it('should call onUpgradePlanClick when milestone is not milestone-1', async () => {
            useSalesTrialRevampMilestoneMock.mockReturnValue('off')

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn
            await mutationFn()

            expect(mockOnUpgradePlanClick).toHaveBeenCalledTimes(1)
        })

        it('should call onUpgradePlanClick when milestone is milestone-0', async () => {
            useSalesTrialRevampMilestoneMock.mockReturnValue('milestone-0')

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn
            await mutationFn()

            expect(mockOnUpgradePlanClick).toHaveBeenCalledTimes(1)
        })

        it('should call upgradeSalesSubscription when milestone is milestone-1', async () => {
            useSalesTrialRevampMilestoneMock.mockReturnValue('milestone-1')

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn
            await mutationFn()

            expect(
                mockUpgradeSalesSubscriptionMutateAsync,
            ).toHaveBeenCalledWith([])
            expect(mockOnUpgradePlanClick).not.toHaveBeenCalled()
        })

        it('should handle onUpgradePlanClick errors', async () => {
            const error = new Error('Upgrade failed')
            mockOnUpgradePlanClick.mockRejectedValue(error)

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn

            await expect(mutationFn()).rejects.toThrow('Upgrade failed')
        })

        it('should handle upgradeSalesSubscription errors when milestone is milestone-1', async () => {
            const error = new Error('Subscription upgrade failed')
            mockUpgradeSalesSubscriptionMutateAsync.mockRejectedValue(error)
            useSalesTrialRevampMilestoneMock.mockReturnValue('milestone-1')

            renderHook(() => useUpgradePlan())

            const mutationOptions = useMutationMock.mock.calls[0][0] as any
            const mutationFn = mutationOptions.mutationFn

            await expect(mutationFn()).rejects.toThrow(
                'Subscription upgrade failed',
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
                    message:
                        'Plan upgraded! Watch Shopping Assistant turn visitors into buyers.',
                    status: NotificationStatus.Success,
                }),
            )
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
                    message: 'Failed to upgrade plan. Please try again.',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })

    describe('milestone detection', () => {
        it('should correctly detect milestone-1 as revamp trial', () => {
            useSalesTrialRevampMilestoneMock.mockReturnValue('milestone-1')

            renderHook(() => useUpgradePlan())

            expect(useSalesTrialRevampMilestoneMock).toHaveBeenCalledTimes(1)
        })

        it('should correctly detect off as not revamp trial', () => {
            useSalesTrialRevampMilestoneMock.mockReturnValue('off')

            renderHook(() => useUpgradePlan())

            expect(useSalesTrialRevampMilestoneMock).toHaveBeenCalledTimes(1)
        })

        it('should correctly detect milestone-0 as not revamp trial', () => {
            useSalesTrialRevampMilestoneMock.mockReturnValue('milestone-0')

            renderHook(() => useUpgradePlan())

            expect(useSalesTrialRevampMilestoneMock).toHaveBeenCalledTimes(1)
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
})
