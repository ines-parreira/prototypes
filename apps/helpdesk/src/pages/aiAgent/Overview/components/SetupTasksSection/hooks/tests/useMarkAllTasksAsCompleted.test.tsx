import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useUpdatePostStoreInstallationStepPure } from 'models/aiAgentPostStoreInstallationSteps/queries'
import { StepConfiguration } from 'models/aiAgentPostStoreInstallationSteps/types'

import { TaskConfig } from '../../types'
import { useMarkAllTasksAsCompleted } from '../useMarkAllTasksAsCompleted'

jest.mock('models/aiAgentPostStoreInstallationSteps/queries', () => ({
    ...jest.requireActual('models/aiAgentPostStoreInstallationSteps/queries'),
    useUpdatePostStoreInstallationStepPure: jest.fn(),
}))

const mockUseUpdatePostStoreInstallationStepPure =
    useUpdatePostStoreInstallationStepPure as jest.MockedFunction<
        typeof useUpdatePostStoreInstallationStepPure
    >

describe('useMarkAllTasksAsCompleted', () => {
    let queryClient: QueryClient
    const mockMutateAsync = jest.fn()

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()

        mockUseUpdatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: mockMutateAsync,
            mutate: jest.fn(),
            reset: jest.fn(),
            isSuccess: false,
            isError: false,
            isIdle: true,
            status: 'idle',
            data: undefined,
            error: null,
            failureCount: 0,
            failureReason: null,
            variables: undefined,
            context: undefined,
            isPaused: false,
            isPending: false,
        } as any)
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockStepConfiguration: StepConfiguration[] = [
        {
            stepName: 'TASK_1' as any,
            stepStartedDatetime: null,
            stepCompletedDatetime: null,
            stepDismissedDatetime: null,
        },
        {
            stepName: 'TASK_2' as any,
            stepStartedDatetime: null,
            stepCompletedDatetime: '2024-01-01T00:00:00Z',
            stepDismissedDatetime: null,
        },
    ]

    const mockTasksConfigByCategory: Partial<Record<string, TaskConfig[]>> = {
        Essential: [
            {
                stepName: 'TASK_1' as any,
                displayName: 'Task 1',
                isCompleted: false,
                body: jest.fn() as any,
            },
            {
                stepName: 'TASK_2' as any,
                displayName: 'Task 2',
                isCompleted: true,
                body: jest.fn() as any,
            },
        ],
    }

    it('should mark all incomplete tasks as completed', async () => {
        mockMutateAsync.mockResolvedValue({})

        const { result } = renderHook(
            () =>
                useMarkAllTasksAsCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStepConfiguration: mockStepConfiguration,
                    tasksConfigByCategory: mockTasksConfigByCategory,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await act(async () => {
            await result.current.markAllAsCompleted()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            'step-id',
            {
                stepsConfiguration: [
                    {
                        stepName: 'TASK_1',
                        stepStartedDatetime: null,
                        stepCompletedDatetime: expect.any(String),
                        stepDismissedDatetime: null,
                    },
                    {
                        stepName: 'TASK_2',
                        stepStartedDatetime: null,
                        stepCompletedDatetime: '2024-01-01T00:00:00Z',
                        stepDismissedDatetime: null,
                    },
                ],
            },
        ])
    })

    it('should not call mutation when postGoLiveStepId is undefined', async () => {
        const { result } = renderHook(
            () =>
                useMarkAllTasksAsCompleted({
                    postGoLiveStepId: undefined,
                    postGoLiveStepConfiguration: mockStepConfiguration,
                    tasksConfigByCategory: mockTasksConfigByCategory,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await act(async () => {
            await result.current.markAllAsCompleted()
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('should not call mutation when postGoLiveStepConfiguration is undefined', async () => {
        const { result } = renderHook(
            () =>
                useMarkAllTasksAsCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStepConfiguration: undefined,
                    tasksConfigByCategory: mockTasksConfigByCategory,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await act(async () => {
            await result.current.markAllAsCompleted()
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockMutateAsync.mockRejectedValue(new Error('Mutation failed'))

        const { result } = renderHook(
            () =>
                useMarkAllTasksAsCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStepConfiguration: mockStepConfiguration,
                    tasksConfigByCategory: mockTasksConfigByCategory,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await act(async () => {
            await result.current.markAllAsCompleted()
        })

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to mark all tasks as completed:',
            expect.any(Error),
        )

        consoleErrorSpy.mockRestore()
    })

    it('should invalidate queries after successful mutation', async () => {
        mockMutateAsync.mockResolvedValue({})
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        let onSuccessCallback: (() => void) | undefined

        mockUseUpdatePostStoreInstallationStepPure.mockImplementation(
            ({ onSuccess }: any) => {
                onSuccessCallback = onSuccess
                return {
                    mutateAsync: mockMutateAsync,
                    mutate: jest.fn(),
                    reset: jest.fn(),
                    isSuccess: false,
                    isError: false,
                    isIdle: true,
                    status: 'idle',
                    data: undefined,
                    error: null,
                    failureCount: 0,
                    failureReason: null,
                    variables: undefined,
                    context: undefined,
                    isPaused: false,
                    isPending: false,
                } as any
            },
        )

        const { result } = renderHook(
            () =>
                useMarkAllTasksAsCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStepConfiguration: mockStepConfiguration,
                    tasksConfigByCategory: mockTasksConfigByCategory,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await act(async () => {
            await result.current.markAllAsCompleted()
            onSuccessCallback?.()
        })

        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalled()
        })
    })

    it('should keep already completed tasks unchanged', async () => {
        mockMutateAsync.mockResolvedValue({})

        const tasksAllCompleted: Partial<Record<string, TaskConfig[]>> = {
            Essential: [
                {
                    stepName: 'TASK_1' as any,
                    displayName: 'Task 1',
                    isCompleted: true,
                    body: jest.fn() as any,
                },
                {
                    stepName: 'TASK_2' as any,
                    displayName: 'Task 2',
                    isCompleted: true,
                    body: jest.fn() as any,
                },
            ],
        }

        const stepsAllCompleted: StepConfiguration[] = [
            {
                stepName: 'TASK_1' as any,
                stepStartedDatetime: null,
                stepCompletedDatetime: '2024-01-01T00:00:00Z',
                stepDismissedDatetime: null,
            },
            {
                stepName: 'TASK_2' as any,
                stepStartedDatetime: null,
                stepCompletedDatetime: '2024-01-01T00:00:00Z',
                stepDismissedDatetime: null,
            },
        ]

        const { result } = renderHook(
            () =>
                useMarkAllTasksAsCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStepConfiguration: stepsAllCompleted,
                    tasksConfigByCategory: tasksAllCompleted,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await act(async () => {
            await result.current.markAllAsCompleted()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            'step-id',
            {
                stepsConfiguration: stepsAllCompleted,
            },
        ])
    })
})
