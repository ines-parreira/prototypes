import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    PostStoreInstallationStepsResponse,
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { mockPostStoreInstallationStep } from 'pages/aiAgent/fixtures//post-store-installation-steps.fixture'

import { usePostStoreInstallationStepsMutation } from './usePostStoreInstallationStepsMutation'

// Mock the auth interceptor to prevent auth requests
jest.mock('utils/gorgiasAppsAuth', () => ({
    __esModule: true,
    default: (config: any) => {
        // Add a dummy token to bypass auth
        config.headers = {
            ...config.headers,
            Authorization: 'Bearer test-token',
        }
        return config
    },
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const mockResponse: PostStoreInstallationStepsResponse = {
    postStoreInstallationSteps: mockPostStoreInstallationStep,
}

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('usePostStoreInstallationStepsMutation', () => {
    const accountDomain = 'test-domain'
    const shopName = 'test-shop'
    const baseURL = 'http://localhost:9402'

    describe('createPostStoreInstallationStep', () => {
        it('should create a new post-store installation step', async () => {
            const createHandler = http.post(
                `${baseURL}/api/config/post-store-installation-steps`,
                async () => {
                    return HttpResponse.json(mockResponse)
                },
            )
            server.use(createHandler)

            const { result } = renderHook(
                () =>
                    usePostStoreInstallationStepsMutation({
                        accountDomain,
                        shopName,
                    }),
                { wrapper: createWrapper() },
            )

            const createData = {
                accountId: 100,
                shopName: 'test-shop',
                shopType: 'shopify',
                status: PostStoreInstallationStepStatus.NOT_STARTED,
                type: PostStoreInstallationStepType.POST_ONBOARDING,
                stepsConfiguration: [
                    {
                        stepName: StepName.TRAIN,
                        stepStartedDatetime: null,
                        stepCompletedDatetime: null,
                        stepDismissedDatetime: null,
                    },
                ],
                notificationsConfiguration: {
                    guidanceInactivityAcknowledgedAt: null,
                    deployInactivityAcknowledgedAt: null,
                },
                completedDatetime: null,
            }

            let createdStep
            await act(async () => {
                createdStep =
                    await result.current.createPostStoreInstallationStep(
                        createData,
                    )
            })

            expect(createdStep).toEqual(mockPostStoreInstallationStep)
        })

        it('should handle creation errors', async () => {
            const errorHandler = http.post(
                `${baseURL}/api/config/post-store-installation-steps`,
                async () => {
                    return HttpResponse.json(
                        { error: { msg: 'Creation failed' } },
                        { status: 400 },
                    )
                },
            )
            server.use(errorHandler)

            const { result } = renderHook(
                () =>
                    usePostStoreInstallationStepsMutation({
                        accountDomain,
                        shopName,
                    }),
                { wrapper: createWrapper() },
            )

            const createData = {
                accountId: 100,
                shopName: 'test-shop',
                shopType: 'shopify',
                status: PostStoreInstallationStepStatus.NOT_STARTED,
                type: PostStoreInstallationStepType.POST_ONBOARDING,
                stepsConfiguration: [],
                notificationsConfiguration: {
                    guidanceInactivityAcknowledgedAt: null,
                    deployInactivityAcknowledgedAt: null,
                },
                completedDatetime: null,
            }

            await expect(
                act(async () => {
                    await result.current.createPostStoreInstallationStep(
                        createData,
                    )
                }),
            ).rejects.toThrow()
        })
    })

    describe('updatePostStoreInstallationStep', () => {
        it('should update an existing post-store installation step', async () => {
            const updatedStep = {
                ...mockPostStoreInstallationStep,
                status: PostStoreInstallationStepStatus.IN_PROGRESS,
            }

            const updateHandler = http.put(
                `${baseURL}/api/config/post-store-installation-steps/:id`,
                async () => {
                    return HttpResponse.json({
                        postStoreInstallationSteps: updatedStep,
                    })
                },
            )
            server.use(updateHandler)

            const { result } = renderHook(
                () =>
                    usePostStoreInstallationStepsMutation({
                        accountDomain,
                        shopName,
                    }),
                { wrapper: createWrapper() },
            )

            let updated
            await act(async () => {
                updated = await result.current.updatePostStoreInstallationStep(
                    'test-id-123',
                    {
                        status: PostStoreInstallationStepStatus.IN_PROGRESS,
                    },
                )
            })

            expect(updated).toEqual(updatedStep)
        })

        it('should handle update errors', async () => {
            const errorHandler = http.put(
                `${baseURL}/api/config/post-store-installation-steps/:id`,
                async () => {
                    return HttpResponse.json(
                        { error: { msg: 'Update failed' } },
                        { status: 400 },
                    )
                },
            )
            server.use(errorHandler)

            const { result } = renderHook(
                () =>
                    usePostStoreInstallationStepsMutation({
                        accountDomain,
                        shopName,
                    }),
                { wrapper: createWrapper() },
            )

            await expect(
                act(async () => {
                    await result.current.updatePostStoreInstallationStep(
                        'test-id-123',
                        {
                            status: PostStoreInstallationStepStatus.COMPLETED,
                        },
                    )
                }),
            ).rejects.toThrow()
        })
    })

    describe('updateStepConfiguration', () => {
        it('should update step configuration', async () => {
            const updatedStep = {
                ...mockPostStoreInstallationStep,
                stepsConfiguration: [
                    {
                        stepName: StepName.TRAIN,
                        stepStartedDatetime: '2024-01-01T10:00:00Z',
                        stepCompletedDatetime: null,
                        stepDismissedDatetime: null,
                    },
                    ...mockPostStoreInstallationStep.stepsConfiguration.slice(
                        1,
                    ),
                ],
            }

            const updateHandler = http.patch(
                `${baseURL}/api/config/post-store-installation-steps/:id/step`,
                async () => {
                    return HttpResponse.json({
                        postStoreInstallationSteps: updatedStep,
                    })
                },
            )
            server.use(updateHandler)

            const { result } = renderHook(
                () =>
                    usePostStoreInstallationStepsMutation({
                        accountDomain,
                        shopName,
                    }),
                { wrapper: createWrapper() },
            )

            let updated
            await act(async () => {
                updated = await result.current.updateStepConfiguration(
                    'test-id-123',
                    {
                        stepName: StepName.TRAIN,
                        stepStartedDatetime: '2024-01-01T10:00:00Z',
                    },
                )
            })

            expect(updated).toEqual(updatedStep)
        })
    })

    describe('updateStepNotifications', () => {
        it('should update notification acknowledgements', async () => {
            const updatedStep = {
                ...mockPostStoreInstallationStep,
                notificationsConfiguration: {
                    guidanceInactivityAcknowledgedAt: '2024-01-01T12:00:00Z',
                    deployInactivityAcknowledgedAt: null,
                },
            }

            const updateHandler = http.patch(
                `${baseURL}/api/config/post-store-installation-steps/:id/update-step-notifications`,
                async () => {
                    return HttpResponse.json({
                        postStoreInstallationSteps: updatedStep,
                    })
                },
            )
            server.use(updateHandler)

            const { result } = renderHook(
                () =>
                    usePostStoreInstallationStepsMutation({
                        accountDomain,
                        shopName,
                    }),
                { wrapper: createWrapper() },
            )

            let updated
            await act(async () => {
                updated = await result.current.updateStepNotifications(
                    'test-id-123',
                    {
                        guidanceInactivityAcknowledgedAt:
                            '2024-01-01T12:00:00Z',
                    },
                )
            })

            expect(updated).toEqual(updatedStep)
        })
    })

    describe('loading state', () => {
        it('should handle loading states correctly', async () => {
            const createHandler = http.post(
                `${baseURL}/api/config/post-store-installation-steps`,
                async () => {
                    return HttpResponse.json(mockResponse)
                },
            )
            server.use(createHandler)

            const { result } = renderHook(
                () =>
                    usePostStoreInstallationStepsMutation({
                        accountDomain,
                        shopName,
                    }),
                { wrapper: createWrapper() },
            )

            // Initially not loading
            expect(result.current.isLoading).toBe(false)

            // Execute a mutation and verify it completes
            await act(async () => {
                await result.current.createPostStoreInstallationStep({
                    accountId: 100,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    status: PostStoreInstallationStepStatus.NOT_STARTED,
                    type: PostStoreInstallationStepType.POST_ONBOARDING,
                    stepsConfiguration: [],
                    notificationsConfiguration: {
                        guidanceInactivityAcknowledgedAt: null,
                        deployInactivityAcknowledgedAt: null,
                    },
                    completedDatetime: null,
                })
            })

            // Should return to not loading after completion
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('query invalidation', () => {
        it('should invalidate queries after successful operations', async () => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: { retry: false },
                    mutations: { retry: false },
                },
            })

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

            const createHandler = http.post(
                `${baseURL}/api/config/post-store-installation-steps`,
                async () => {
                    return HttpResponse.json(mockResponse)
                },
            )
            server.use(createHandler)

            const { result } = renderHook(
                () =>
                    usePostStoreInstallationStepsMutation({
                        accountDomain,
                        shopName,
                    }),
                {
                    wrapper: ({ children }: { children: ReactNode }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            await act(async () => {
                await result.current.createPostStoreInstallationStep({
                    accountId: 100,
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    status: PostStoreInstallationStepStatus.NOT_STARTED,
                    type: PostStoreInstallationStepType.POST_ONBOARDING,
                    stepsConfiguration: [],
                    notificationsConfiguration: {
                        guidanceInactivityAcknowledgedAt: null,
                        deployInactivityAcknowledgedAt: null,
                    },
                    completedDatetime: null,
                })
            })

            // Verify that invalidateQueries was called
            expect(invalidateSpy).toHaveBeenCalled()

            // Verify it was called with the expected keys
            const calls = invalidateSpy.mock.calls
            const hasDetailCall = calls.some(
                (call) =>
                    JSON.stringify(call[0]) ===
                    JSON.stringify({
                        queryKey: [
                            'postStoreInstallationSteps',
                            'detail',
                            accountDomain,
                            shopName,
                        ],
                    }),
            )
            const hasAllCall = calls.some(
                (call) =>
                    JSON.stringify(call[0]) ===
                    JSON.stringify({
                        queryKey: ['postStoreInstallationSteps'],
                    }),
            )

            expect(hasDetailCall).toBe(true)
            expect(hasAllCall).toBe(true)

            invalidateSpy.mockRestore()
        })
    })
})
