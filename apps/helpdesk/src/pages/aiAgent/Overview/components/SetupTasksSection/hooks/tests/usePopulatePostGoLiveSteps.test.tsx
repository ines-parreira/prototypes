import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import {
    useCreatePostStoreInstallationStepPure,
    useUpdatePostStoreInstallationStepPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { RuleEngineData } from 'pages/aiAgent/Overview/hooks/pendingTasks/ruleEngine'
import { CreateAnActionTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/CreateAnAction.task'
import { EnableAIAgentOnChatTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/EnableAIAgentOnChat.task'
import { VerifyYourEmailDomainTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/VerifyYourEmailDomain.task'

import { usePopulatePostGoLiveSteps } from '../usePopulatePostGoLiveSteps'

jest.mock('models/aiAgentPostStoreInstallationSteps/queries', () => ({
    ...jest.requireActual('models/aiAgentPostStoreInstallationSteps/queries'),
    useCreatePostStoreInstallationStepPure: jest.fn(),
    useUpdatePostStoreInstallationStepPure: jest.fn(),
}))

const mockUseCreatePostStoreInstallationStepPure =
    useCreatePostStoreInstallationStepPure as jest.MockedFunction<
        typeof useCreatePostStoreInstallationStepPure
    >

const mockUseUpdatePostStoreInstallationStepPure =
    useUpdatePostStoreInstallationStepPure as jest.MockedFunction<
        typeof useUpdatePostStoreInstallationStepPure
    >

describe('usePopulatePostGoLiveSteps', () => {
    let queryClient: QueryClient
    const mockCreateMutateAsync = jest.fn()
    const mockUpdateMutateAsync = jest.fn()

    const mockData = {
        actions: [],
        aiAgentStoreConfiguration: {
            monitoredEmailIntegrations: [],
            monitoredChatIntegrations: [],
        },
        selfServiceChatChannels: [],
        pageInteractions: null,
        isActivationEnabled: false,
        isAiShoppingAssistantEnabled: false,
    } as unknown as RuleEngineData

    const mockRoutes = {
        aiAgentRoutes: {
            actions: '/actions',
            chat: '/chat',
            email: '/email',
        },
    } as any

    const createMockVerifyEmailTask = (
        available: boolean,
        display: boolean = true,
        completed: boolean = false,
    ) => {
        const task = new VerifyYourEmailDomainTask(mockData, mockRoutes)
        Object.defineProperty(task, 'available', {
            value: available,
            writable: true,
        })
        Object.defineProperty(task, 'display', {
            value: display,
            writable: true,
        })
        Object.defineProperty(task, 'completed', {
            value: completed,
            writable: true,
        })
        return task
    }

    const createMockCreateActionTask = (
        available: boolean,
        display: boolean = true,
        completed: boolean = false,
    ) => {
        const task = new CreateAnActionTask(mockData, mockRoutes)
        Object.defineProperty(task, 'available', {
            value: available,
            writable: true,
        })
        Object.defineProperty(task, 'display', {
            value: display,
            writable: true,
        })
        Object.defineProperty(task, 'completed', {
            value: completed,
            writable: true,
        })
        return task
    }

    const createMockEnableChatTask = (
        available: boolean,
        display: boolean = true,
        completed: boolean = false,
    ) => {
        const task = new EnableAIAgentOnChatTask(mockData, mockRoutes)
        Object.defineProperty(task, 'available', {
            value: available,
            writable: true,
        })
        Object.defineProperty(task, 'display', {
            value: display,
            writable: true,
        })
        Object.defineProperty(task, 'completed', {
            value: completed,
            writable: true,
        })
        return task
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
        mockCreateMutateAsync.mockResolvedValue({
            postStoreInstallationSteps: {},
        })
        mockUpdateMutateAsync.mockResolvedValue({})

        mockUseCreatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: mockCreateMutateAsync,
            mutate: jest.fn(),
            reset: jest.fn(),
            isSuccess: false,
            isError: false,
            isIdle: true,
            isLoading: false,
            status: 'idle',
            data: undefined,
            error: null,
            failureCount: 0,
            failureReason: null,
            variables: undefined,
            context: undefined,
            isPaused: false,
        } as any)

        mockUseUpdatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: mockUpdateMutateAsync,
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
        } as any)
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should not create step when enabled is false', async () => {
        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks: [],
                    completedTasks: [],
                    enabled: false,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).not.toHaveBeenCalled()
        })
    })

    it('should not create step when postGoLiveStep already exists', async () => {
        const mockPostGoLiveStep = {
            id: 'test-id',
            stepsConfiguration: [],
        } as any

        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: mockPostGoLiveStep,
                    pendingTasks: [],
                    completedTasks: [],
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).not.toHaveBeenCalled()
        })
    })

    it('should not create step when no available tasks', async () => {
        const pendingTasks = [createMockVerifyEmailTask(false)]

        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks,
                    completedTasks: [],
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).not.toHaveBeenCalled()
        })
    })

    it('should create step with available and displayed tasks', async () => {
        const pendingTasks = [
            createMockVerifyEmailTask(true),
            createMockCreateActionTask(true),
        ]

        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks,
                    completedTasks: [],
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalledWith([
                {
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    status: PostStoreInstallationStepStatus.IN_PROGRESS,
                    type: PostStoreInstallationStepType.POST_GO_LIVE,
                    stepsConfiguration: expect.arrayContaining([
                        expect.objectContaining({
                            stepName: StepName.VERIFY_EMAIL_DOMAIN,
                            stepStartedDatetime: null,
                            stepCompletedDatetime: null,
                            stepDismissedDatetime: null,
                        }),
                        expect.objectContaining({
                            stepName: StepName.CREATE_AN_ACTION,
                            stepStartedDatetime: null,
                            stepCompletedDatetime: null,
                            stepDismissedDatetime: null,
                        }),
                    ]),
                    notificationsConfiguration: null,
                    completedDatetime: null,
                },
            ])
        })
    })

    it('should not include unavailable tasks', async () => {
        const pendingTasks = [
            createMockVerifyEmailTask(true),
            createMockCreateActionTask(false),
        ]

        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks,
                    completedTasks: [],
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalledWith([
                expect.objectContaining({
                    stepsConfiguration: [
                        expect.objectContaining({
                            stepName: StepName.VERIFY_EMAIL_DOMAIN,
                        }),
                    ],
                }),
            ])
        })
    })

    it('should not include completed tasks unless alwaysAvailable is true', async () => {
        const pendingTasks = [createMockVerifyEmailTask(true, true)]
        const completedActionTask = createMockCreateActionTask(true, true, true)
        Object.defineProperty(completedActionTask, 'alwaysAvailable', {
            value: true,
            writable: true,
        })
        const completedTasks = [completedActionTask]

        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks,
                    completedTasks,
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalledWith([
                expect.objectContaining({
                    stepsConfiguration: expect.arrayContaining([
                        expect.objectContaining({
                            stepName: StepName.VERIFY_EMAIL_DOMAIN,
                        }),
                        expect.objectContaining({
                            stepName: StepName.CREATE_AN_ACTION,
                        }),
                    ]),
                }),
            ])
        })
    })

    it('should handle mutation errors gracefully', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockCreateMutateAsync.mockRejectedValue(new Error('Mutation failed'))

        const pendingTasks = [
            createMockVerifyEmailTask(true),
            createMockCreateActionTask(true),
        ]

        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks,
                    completedTasks: [],
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to create POST_GO_LIVE step:',
                expect.any(Error),
            )
        })

        consoleErrorSpy.mockRestore()
    })

    it('should work with completed tasks', async () => {
        const completedTasks = [
            createMockVerifyEmailTask(true),
            createMockCreateActionTask(true),
        ]

        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks: [],
                    completedTasks,
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalled()
        })
    })

    it('should include all available and displayed tasks from multiple categories', async () => {
        const pendingTasks = [
            createMockVerifyEmailTask(true),
            createMockCreateActionTask(true),
            createMockEnableChatTask(true),
        ]

        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks,
                    completedTasks: [],
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalledWith([
                expect.objectContaining({
                    stepsConfiguration: expect.arrayContaining([
                        expect.objectContaining({
                            stepName: StepName.VERIFY_EMAIL_DOMAIN,
                        }),
                        expect.objectContaining({
                            stepName: StepName.CREATE_AN_ACTION,
                        }),
                        expect.objectContaining({
                            stepName: StepName.ENABLE_AI_AGENT_ON_CHAT,
                        }),
                    ]),
                }),
            ])
        })
    })

    it('should only call create once', async () => {
        const pendingTasks = [
            createMockVerifyEmailTask(true),
            createMockCreateActionTask(true),
        ]

        renderHook(
            () =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks,
                    completedTasks: [],
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalledTimes(1)
        })
    })

    it('should only call create once even when dependencies change', async () => {
        const initialPendingTasks: (
            | VerifyYourEmailDomainTask
            | CreateAnActionTask
            | EnableAIAgentOnChatTask
        )[] = [
            createMockVerifyEmailTask(true),
            createMockCreateActionTask(true),
        ]

        const { rerender } = renderHook(
            ({
                pendingTasks,
            }: {
                pendingTasks: (
                    | VerifyYourEmailDomainTask
                    | CreateAnActionTask
                    | EnableAIAgentOnChatTask
                )[]
            }) =>
                usePopulatePostGoLiveSteps({
                    postGoLiveStep: undefined,
                    pendingTasks,
                    completedTasks: [],
                    enabled: true,
                    accountId: 123,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                }),
            {
                wrapper,
                initialProps: { pendingTasks: initialPendingTasks },
            },
        )

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalledTimes(1)
        })

        const newPendingTasks: (
            | VerifyYourEmailDomainTask
            | CreateAnActionTask
            | EnableAIAgentOnChatTask
        )[] = [
            createMockVerifyEmailTask(true),
            createMockCreateActionTask(true),
            createMockEnableChatTask(true),
        ]

        rerender({ pendingTasks: newPendingTasks })

        await waitFor(
            () => {
                expect(mockCreateMutateAsync).toHaveBeenCalledTimes(1)
            },
            { timeout: 2000 },
        )
    })
})
