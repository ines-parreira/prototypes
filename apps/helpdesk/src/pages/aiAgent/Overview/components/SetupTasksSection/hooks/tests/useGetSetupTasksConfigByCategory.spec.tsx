import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import {
    useCreatePostStoreInstallationStepPure,
    useGetPostStoreInstallationStepsPure,
    useUpdatePostStoreInstallationStepPure,
    useUpdateStepConfigurationPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    PostStoreInstallationStepType,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { TasksCategory } from 'pages/aiAgent/Overview/components/SetupTasksSection/types'
import { Task } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/Task'
import { usePendingTasksRuleEngine } from 'pages/aiAgent/Overview/hooks/pendingTasks/usePendingTasksRuleEngine'
import { mockStore } from 'utils/testing'

import { useGetSetupTasksConfigByCategory } from '../useGetSetupTasksConfigByCategory'

jest.mock('models/aiAgentPostStoreInstallationSteps/queries')
jest.mock('pages/aiAgent/Overview/hooks/pendingTasks/usePendingTasksRuleEngine')

const mockUseGetPostStoreInstallationStepsPure =
    useGetPostStoreInstallationStepsPure as jest.MockedFunction<
        typeof useGetPostStoreInstallationStepsPure
    >

const mockUseCreatePostStoreInstallationStepPure =
    useCreatePostStoreInstallationStepPure as jest.MockedFunction<
        typeof useCreatePostStoreInstallationStepPure
    >

const mockUseUpdatePostStoreInstallationStepPure =
    useUpdatePostStoreInstallationStepPure as jest.MockedFunction<
        typeof useUpdatePostStoreInstallationStepPure
    >

const mockUseUpdateStepConfigurationPure =
    useUpdateStepConfigurationPure as jest.MockedFunction<
        typeof useUpdateStepConfigurationPure
    >

const mockUsePendingTasksRuleEngine =
    usePendingTasksRuleEngine as jest.MockedFunction<
        typeof usePendingTasksRuleEngine
    >

const createMockTask = (
    taskClassName: string,
    display: boolean = true,
    isCheckedAutomatically: boolean = false,
    completed: boolean = false,
): Task => {
    const mockTask = {
        display,
        featureUrl: '/mock-url',
        available: true,
        title: 'Mock Title',
        caption: 'Mock Caption',
        type: 'BASIC' as const,
        isCheckedAutomatically,
        completed,
        constructor: {
            name: taskClassName,
        },
    }
    return mockTask as Task
}

describe('useGetSetupTasksConfigByCategory', () => {
    let queryClient: QueryClient
    let store: ReturnType<typeof mockStore>

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        store = mockStore(
            fromJS({
                currentAccount: {
                    accountId: 123,
                    accountDomain: 'test-domain.com',
                },
            }),
        )
        jest.clearAllMocks()

        mockUsePendingTasksRuleEngine.mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [],
            completedTasks: [],
        })

        mockUseUpdatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
            mutate: jest.fn(),
            isLoading: false,
            isError: false,
            isSuccess: false,
            isIdle: true,
        } as any)

        mockUseUpdateStepConfigurationPure.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
            mutate: jest.fn(),
            isLoading: false,
            isError: false,
            isSuccess: false,
            isIdle: true,
        } as any)

        mockUseCreatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
            mutate: jest.fn(),
            isLoading: false,
            isError: false,
            isSuccess: false,
            isIdle: true,
        } as any)
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )

    const defaultParams = {
        accountId: 123,
        shopName: 'test-shop',
        shopType: 'shopify',
    }

    it('should return empty object when no data is available', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        } as any)

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(result.current.tasksConfigByCategory).toEqual({})
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBe(null)
    })

    it('should return empty object when postStoreInstallationSteps is empty', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [],
            },
            isLoading: false,
            error: null,
        } as any)

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(result.current.tasksConfigByCategory).toEqual({})
    })

    it('should return empty object when no POST_GO_LIVE steps are found', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_ONBOARDING,
                        stepsConfiguration: [
                            {
                                stepName: StepName.MONITOR,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            error: null,
        } as any)

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(result.current.tasksConfigByCategory).toEqual({})
    })

    it('should return tasks for categories with matching steps', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_GO_LIVE,
                        stepsConfiguration: [
                            {
                                stepName: StepName.VERIFY_EMAIL_DOMAIN,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                            {
                                stepName: StepName.CREATE_AN_ACTION,
                                stepCompletedDatetime: '2024-01-01T00:00:00Z',
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            error: null,
        } as any)

        mockUsePendingTasksRuleEngine.mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [createMockTask('VerifyYourEmailDomainTask')],
            completedTasks: [createMockTask('CreateAnActionTask', false)],
        })

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(Object.keys(result.current.tasksConfigByCategory)).toContain(
            TasksCategory.Essential,
        )
        expect(Object.keys(result.current.tasksConfigByCategory)).toContain(
            TasksCategory.Train,
        )

        const essentialTasks =
            result.current.tasksConfigByCategory[TasksCategory.Essential]
        expect(essentialTasks).toHaveLength(1)
        expect(essentialTasks?.[0].stepName).toBe(StepName.VERIFY_EMAIL_DOMAIN)
        expect(essentialTasks?.[0].displayName).toBe('Verify your email domain')
        expect(essentialTasks?.[0].isCompleted).toBe(false)

        const trainTasks =
            result.current.tasksConfigByCategory[TasksCategory.Train]
        expect(trainTasks).toHaveLength(1)
        expect(trainTasks?.[0].stepName).toBe(StepName.CREATE_AN_ACTION)
        expect(trainTasks?.[0].displayName).toBe('Create an Action')
        expect(trainTasks?.[0].isCompleted).toBe(true)
    })

    it('should correctly set isCompleted based on stepCompletedDatetime', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_GO_LIVE,
                        stepsConfiguration: [
                            {
                                stepName: StepName.ENABLE_TRIGGER_ON_SEARCH,
                                stepCompletedDatetime: '2024-01-01T00:00:00Z',
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                            {
                                stepName: StepName.ENABLE_SUGGESTED_PRODUCTS,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            error: null,
        } as any)

        mockUsePendingTasksRuleEngine.mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [
                createMockTask('EnableSuggestedProductQuestionsTask'),
            ],
            completedTasks: [
                createMockTask('EnableTriggerOnSearchTask', false),
            ],
        })

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        const customizeTasks =
            result.current.tasksConfigByCategory[TasksCategory.Customize]
        expect(customizeTasks).toHaveLength(2)
        expect(customizeTasks?.[0].isCompleted).toBe(true)
        expect(customizeTasks?.[1].isCompleted).toBe(false)
    })

    it('should not include categories with no matching steps', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_GO_LIVE,
                        stepsConfiguration: [
                            {
                                stepName: StepName.ENABLE_SUGGESTED_PRODUCTS,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            error: null,
        } as any)

        mockUsePendingTasksRuleEngine.mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [
                createMockTask('EnableSuggestedProductQuestionsTask'),
            ],
            completedTasks: [],
        })

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(Object.keys(result.current.tasksConfigByCategory)).toEqual([
            TasksCategory.Customize,
        ])
        expect(
            result.current.tasksConfigByCategory[TasksCategory.Essential],
        ).toBeUndefined()
        expect(
            result.current.tasksConfigByCategory[TasksCategory.Deploy],
        ).toBeUndefined()
        expect(
            result.current.tasksConfigByCategory[TasksCategory.Train],
        ).toBeUndefined()
    })

    it('should return all categories when all steps are present', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_GO_LIVE,
                        stepsConfiguration: [
                            {
                                stepName: StepName.VERIFY_EMAIL_DOMAIN,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                            {
                                stepName: StepName.UPDATE_SHOPIFY_PERMISSIONS,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                            {
                                stepName: StepName.ENABLE_TRIGGER_ON_SEARCH,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                            {
                                stepName: StepName.CREATE_AN_ACTION,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                            {
                                stepName: StepName.ENABLE_AI_AGENT_ON_CHAT,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            error: null,
        } as any)

        mockUsePendingTasksRuleEngine.mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [
                createMockTask('VerifyYourEmailDomainTask'),
                createMockTask('UpdateShopifyPermissionsTask'),
                createMockTask('EnableTriggerOnSearchTask'),
                createMockTask('CreateAnActionTask'),
                createMockTask('EnableAIAgentOnChatTask'),
            ],
            completedTasks: [],
        })

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(Object.keys(result.current.tasksConfigByCategory)).toHaveLength(
            4,
        )
        expect(
            result.current.tasksConfigByCategory[TasksCategory.Essential],
        ).toBeDefined()
        expect(
            result.current.tasksConfigByCategory[TasksCategory.Customize],
        ).toBeDefined()
        expect(
            result.current.tasksConfigByCategory[TasksCategory.Train],
        ).toBeDefined()
        expect(
            result.current.tasksConfigByCategory[TasksCategory.Deploy],
        ).toBeDefined()
    })

    it('should pass through loading state', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any)

        mockUsePendingTasksRuleEngine.mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [
                createMockTask('VerifyYourEmailDomainTask'),
                createMockTask('UpdateShopifyPermissionsTask'),
                createMockTask('EnableTriggerOnSearchTask'),
                createMockTask('CreateAnActionTask'),
                createMockTask('EnableAIAgentOnChatTask'),
            ],
            completedTasks: [],
        })

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should pass through error state', () => {
        const error = new Error('Test error')
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: undefined,
            isLoading: false,
            error,
        } as any)

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(result.current.error).toBe(error)
    })

    it('should include body component reference for each task', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_GO_LIVE,
                        stepsConfiguration: [
                            {
                                stepName: StepName.VERIFY_EMAIL_DOMAIN,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            error: null,
        } as any)

        mockUsePendingTasksRuleEngine.mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [createMockTask('VerifyYourEmailDomainTask')],
            completedTasks: [],
        })

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        const essentialTasks =
            result.current.tasksConfigByCategory[TasksCategory.Essential]
        expect(essentialTasks?.[0].body).toBeDefined()
        expect(typeof essentialTasks?.[0].body).toBe('function')
    })

    it('should calculate completion percentage correctly', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_GO_LIVE,
                        stepsConfiguration: [
                            {
                                stepName: StepName.VERIFY_EMAIL_DOMAIN,
                                stepCompletedDatetime: null,
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                            {
                                stepName: StepName.CREATE_AN_ACTION,
                                stepCompletedDatetime: '2024-01-01T00:00:00Z',
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                            {
                                stepName: StepName.ENABLE_AI_AGENT_ON_CHAT,
                                stepCompletedDatetime: '2024-01-01T00:00:00Z',
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            error: null,
        } as any)

        mockUsePendingTasksRuleEngine.mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [createMockTask('VerifyYourEmailDomainTask')],
            completedTasks: [
                createMockTask('CreateAnActionTask', false),
                createMockTask('EnableAIAgentOnChatTask', false),
            ],
        })

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(result.current.completionPercentage).toBe(67)
    })

    it('should return 0 percentage when no tasks', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        } as any)

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(result.current.completionPercentage).toBe(0)
    })

    it('should return 100 percentage when all tasks completed', () => {
        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_GO_LIVE,
                        stepsConfiguration: [
                            {
                                stepName: StepName.CREATE_AN_ACTION,
                                stepCompletedDatetime: '2024-01-01T00:00:00Z',
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                            {
                                stepName: StepName.ENABLE_AI_AGENT_ON_CHAT,
                                stepCompletedDatetime: '2024-01-01T00:00:00Z',
                                stepStartedDatetime: null,
                                stepDismissedDatetime: null,
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            error: null,
        } as any)

        mockUsePendingTasksRuleEngine.mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [],
            completedTasks: [
                createMockTask('CreateAnActionTask', false),
                createMockTask('EnableAIAgentOnChatTask', false),
            ],
        })

        const { result } = renderHook(
            () => useGetSetupTasksConfigByCategory(defaultParams),
            { wrapper },
        )

        expect(result.current.completionPercentage).toBe(100)
    })

    describe('sync functionality', () => {
        it('should sync task completion from rule engine to database when isCheckedAutomatically is true', async () => {
            const mockMutateAsync = jest.fn().mockResolvedValue({})
            mockUseUpdateStepConfigurationPure.mockReturnValue({
                mutateAsync: mockMutateAsync,
                mutate: jest.fn(),
                isLoading: false,
                isError: false,
                isSuccess: false,
                isIdle: true,
            } as any)

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [
                        {
                            id: 'step-id-123',
                            type: PostStoreInstallationStepType.POST_GO_LIVE,
                            stepsConfiguration: [
                                {
                                    stepName: StepName.VERIFY_EMAIL_DOMAIN,
                                    stepCompletedDatetime: null,
                                    stepStartedDatetime: null,
                                    stepDismissedDatetime: null,
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
                error: null,
            } as any)

            mockUsePendingTasksRuleEngine.mockReturnValue({
                isLoading: false,
                isFetched: true,
                pendingTasks: [],
                completedTasks: [
                    createMockTask(
                        'VerifyYourEmailDomainTask',
                        false,
                        true,
                        true,
                    ),
                ],
            })

            renderHook(() => useGetSetupTasksConfigByCategory(defaultParams), {
                wrapper,
            })

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith([
                    'step-id-123',
                    {
                        stepName: StepName.VERIFY_EMAIL_DOMAIN,
                        stepCompletedDatetime: expect.any(String),
                    },
                ])
            })
        })

        it('should not sync when isCheckedAutomatically is false', async () => {
            const mockMutateAsync = jest.fn().mockResolvedValue({})
            mockUseUpdateStepConfigurationPure.mockReturnValue({
                mutateAsync: mockMutateAsync,
                mutate: jest.fn(),
                isLoading: false,
                isError: false,
                isSuccess: false,
                isIdle: true,
            } as any)

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [
                        {
                            id: 'step-id-123',
                            type: PostStoreInstallationStepType.POST_GO_LIVE,
                            stepsConfiguration: [
                                {
                                    stepName: StepName.CREATE_AN_ACTION,
                                    stepCompletedDatetime: null,
                                    stepStartedDatetime: null,
                                    stepDismissedDatetime: null,
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
                error: null,
            } as any)

            mockUsePendingTasksRuleEngine.mockReturnValue({
                isLoading: false,
                isFetched: true,
                pendingTasks: [],
                completedTasks: [
                    createMockTask('CreateAnActionTask', false, false),
                ],
            })

            renderHook(() => useGetSetupTasksConfigByCategory(defaultParams), {
                wrapper,
            })

            await waitFor(() => {
                expect(mockMutateAsync).not.toHaveBeenCalled()
            })
        })

        it('should not sync when database and rule engine are already in sync', async () => {
            const mockMutateAsync = jest.fn().mockResolvedValue({})
            mockUseUpdateStepConfigurationPure.mockReturnValue({
                mutateAsync: mockMutateAsync,
                mutate: jest.fn(),
                isLoading: false,
                isError: false,
                isSuccess: false,
                isIdle: true,
            } as any)

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [
                        {
                            id: 'step-id-123',
                            type: PostStoreInstallationStepType.POST_GO_LIVE,
                            stepsConfiguration: [
                                {
                                    stepName: StepName.VERIFY_EMAIL_DOMAIN,
                                    stepCompletedDatetime:
                                        '2024-01-01T00:00:00Z',
                                    stepStartedDatetime: null,
                                    stepDismissedDatetime: null,
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
                error: null,
            } as any)

            mockUsePendingTasksRuleEngine.mockReturnValue({
                isLoading: false,
                isFetched: true,
                pendingTasks: [],
                completedTasks: [
                    createMockTask(
                        'VerifyYourEmailDomainTask',
                        false,
                        true,
                        true,
                    ),
                ],
            })

            renderHook(() => useGetSetupTasksConfigByCategory(defaultParams), {
                wrapper,
            })

            await waitFor(() => {
                expect(mockMutateAsync).not.toHaveBeenCalled()
            })
        })

        it('should handle sync errors gracefully', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()
            const mockMutateAsync = jest
                .fn()
                .mockRejectedValue(new Error('Sync failed'))
            mockUseUpdateStepConfigurationPure.mockReturnValue({
                mutateAsync: mockMutateAsync,
                mutate: jest.fn(),
                isLoading: false,
                isError: false,
                isSuccess: false,
                isIdle: true,
            } as any)

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [
                        {
                            id: 'step-id-123',
                            type: PostStoreInstallationStepType.POST_GO_LIVE,
                            stepsConfiguration: [
                                {
                                    stepName: StepName.VERIFY_EMAIL_DOMAIN,
                                    stepCompletedDatetime: null,
                                    stepStartedDatetime: null,
                                    stepDismissedDatetime: null,
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
                error: null,
            } as any)

            mockUsePendingTasksRuleEngine.mockReturnValue({
                isLoading: false,
                isFetched: true,
                pendingTasks: [],
                completedTasks: [
                    createMockTask(
                        'VerifyYourEmailDomainTask',
                        false,
                        true,
                        true,
                    ),
                ],
            })

            const { result } = renderHook(
                () => useGetSetupTasksConfigByCategory(defaultParams),
                {
                    wrapper,
                },
            )

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Failed to sync step'),
                    expect.any(Error),
                )
            })

            expect(result.current.error).toBeNull()

            consoleErrorSpy.mockRestore()
        })
    })
})
