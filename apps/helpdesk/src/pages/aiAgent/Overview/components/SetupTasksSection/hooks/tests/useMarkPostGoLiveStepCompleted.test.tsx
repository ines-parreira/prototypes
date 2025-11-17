import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useUpdatePostStoreInstallationStepPure } from 'models/aiAgentPostStoreInstallationSteps/queries'
import type { PostStoreInstallationSteps } from 'models/aiAgentPostStoreInstallationSteps/types'
import { PostStoreInstallationStepStatus } from 'models/aiAgentPostStoreInstallationSteps/types'

import { useMarkPostGoLiveStepCompleted } from '../useMarkPostGoLiveStepCompleted'

jest.mock('models/aiAgentPostStoreInstallationSteps/queries', () => ({
    ...jest.requireActual('models/aiAgentPostStoreInstallationSteps/queries'),
    useUpdatePostStoreInstallationStepPure: jest.fn(),
}))

const mockUseUpdatePostStoreInstallationStepPure =
    useUpdatePostStoreInstallationStepPure as jest.MockedFunction<
        typeof useUpdatePostStoreInstallationStepPure
    >

describe('useMarkPostGoLiveStepCompleted', () => {
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

    it('should not show modal when tasks are not completed', () => {
        const { result } = renderHook(
            () =>
                useMarkPostGoLiveStepCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStep: {
                        id: 'step-id',
                        completedDatetime: null,
                    } as PostStoreInstallationSteps,
                    isAllTasksCompleted: false,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        expect(result.current.showCompletionModal).toBe(false)
    })

    it('should show modal when all tasks are completed', async () => {
        const { result } = renderHook(
            () =>
                useMarkPostGoLiveStepCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStep: {
                        id: 'step-id',
                        completedDatetime: null,
                    } as PostStoreInstallationSteps,
                    isAllTasksCompleted: true,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.showCompletionModal).toBe(true)
        })
    })

    it('should not show modal when POST_GO_LIVE step is already completed', () => {
        const { result } = renderHook(
            () =>
                useMarkPostGoLiveStepCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStep: {
                        id: 'step-id',
                        completedDatetime: '2024-01-01T00:00:00Z',
                    } as PostStoreInstallationSteps,
                    isAllTasksCompleted: true,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        expect(result.current.showCompletionModal).toBe(false)
    })

    it('should mark POST_GO_LIVE step as completed when modal is closed', async () => {
        mockMutateAsync.mockResolvedValue({})

        const { result } = renderHook(
            () =>
                useMarkPostGoLiveStepCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStep: {
                        id: 'step-id',
                        completedDatetime: null,
                    } as PostStoreInstallationSteps,
                    isAllTasksCompleted: true,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.showCompletionModal).toBe(true)
        })

        await act(async () => {
            await result.current.handleCloseModal()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            'step-id',
            {
                completedDatetime: expect.any(String),
                status: PostStoreInstallationStepStatus.COMPLETED,
            },
        ])

        await waitFor(() => {
            expect(result.current.showCompletionModal).toBe(false)
        })
    })

    it('should handle errors when marking step as completed', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockMutateAsync.mockRejectedValue(new Error('Mutation failed'))

        const { result } = renderHook(
            () =>
                useMarkPostGoLiveStepCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStep: {
                        id: 'step-id',
                        completedDatetime: null,
                    } as PostStoreInstallationSteps,
                    isAllTasksCompleted: true,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.showCompletionModal).toBe(true)
        })

        await act(async () => {
            await result.current.handleCloseModal()
        })

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to mark POST_GO_LIVE as completed:',
            expect.any(Error),
        )

        await waitFor(() => {
            expect(result.current.showCompletionModal).toBe(false)
        })

        consoleErrorSpy.mockRestore()
    })

    it('should allow manually triggering the modal', async () => {
        const { result } = renderHook(
            () =>
                useMarkPostGoLiveStepCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStep: {
                        id: 'step-id',
                        completedDatetime: null,
                    } as PostStoreInstallationSteps,
                    isAllTasksCompleted: false,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        expect(result.current.showCompletionModal).toBe(false)

        act(() => {
            result.current.triggerCompletionModal()
        })

        await waitFor(() => {
            expect(result.current.showCompletionModal).toBe(true)
        })
    })

    it('should invalidate queries after marking step as completed', async () => {
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
                useMarkPostGoLiveStepCompleted({
                    postGoLiveStepId: 'step-id',
                    postGoLiveStep: {
                        id: 'step-id',
                        completedDatetime: null,
                    } as PostStoreInstallationSteps,
                    isAllTasksCompleted: true,
                    accountId: 123,
                    shopName: 'test-shop',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.showCompletionModal).toBe(true)
        })

        await act(async () => {
            await result.current.handleCloseModal()
            onSuccessCallback?.()
        })

        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalled()
        })
    })
})
