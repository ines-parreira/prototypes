import type React from 'react'

import { reportError } from '@repo/logging'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import useAppDispatch from 'hooks/useAppDispatch'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useUpsertArticleTemplateReview } from 'pages/settings/helpCenter/queries'
import {
    FeedbackObjectType,
    FeedbackTargetType,
    OpportunityFeedbackType,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { OpportunityType } from '../enums'
import type {
    Opportunity,
    OpportunityConfig,
    ResourceFormFields,
} from '../types'
import { ResourceType } from '../types'
import { useOpportunityCTAs } from './useOpportunityCTAs'
import { useProcessOpportunity } from './useProcessOpportunity'

jest.mock('./useProcessOpportunity', () => ({
    ...jest.requireActual('./useProcessOpportunity'),
    useProcessOpportunity: jest.fn(),
}))
jest.mock('models/knowledgeService/mutations')
jest.mock('pages/settings/helpCenter/queries')
jest.mock('hooks/useAppDispatch')
jest.mock('@repo/logging')
jest.mock('state/notifications/actions')

const mockStore = configureStore([])

const mockOpportunity: Opportunity = {
    id: '123',
    key: 'ai_123',
    type: OpportunityType.FILL_KNOWLEDGE_GAP,
    insight: 'Test Opportunity',
    ticketCount: 5,
    resources: [
        {
            title: 'Test Opportunity',
            content: 'Test content',
            type: ResourceType.GUIDANCE,
            isVisible: true,
        },
    ],
}

const mockOpportunityConfig: OpportunityConfig = {
    shopName: 'test-shop',
    shopIntegrationId: 456,
    helpCenterId: 789,
    guidanceHelpCenterId: 101,
    useKnowledgeService: true,
    onArchive: jest.fn(),
    onPublish: jest.fn(),
    onOpportunityAccepted: jest.fn(),
    onOpportunityDismissed: jest.fn(),
}

const mockFormData: ResourceFormFields = {
    title: 'Test Guidance',
    content: 'Test guidance content',
    isVisible: true,
    isDeleted: false,
}

describe('useOpportunityCTAs', () => {
    let queryClient: QueryClient
    let store: ReturnType<typeof mockStore>

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        store = mockStore({})

        // Mock Redux hooks
        ;(useAppDispatch as jest.Mock).mockReturnValue(jest.fn())

        // Setup default mocks
        ;(useProcessOpportunity as jest.Mock).mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
        })
        ;(useUpsertFeedback as jest.Mock).mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
        })
        ;(useUpsertArticleTemplateReview as jest.Mock).mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
        })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )

    describe('handleApprove', () => {
        it('should call processOpportunity for knowledge service', async () => {
            const mutateAsync = jest.fn().mockResolvedValue({})
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleApprove()

            await waitFor(() => {
                expect(mutateAsync).toHaveBeenCalledWith({
                    shopIntegrationId: 456,
                    opportunityId: 123,
                    data: expect.objectContaining({
                        action: 'APPROVE',
                        title: 'Test Guidance',
                        content: 'Test guidance content',
                        visibilityStatus: 'PUBLIC',
                    }),
                })
                expect(mockOpportunityConfig.onArchive).toHaveBeenCalledWith(
                    'ai_123',
                )
            })
        })

        it('should not process when selectedOpportunity is null', async () => {
            const mutateAsync = jest.fn()
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: null,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleApprove()

            expect(mutateAsync).not.toHaveBeenCalled()
        })

        it('should set isProcessing during approval', async () => {
            const mutateAsync = jest
                .fn()
                .mockImplementation(
                    () => new Promise((resolve) => setTimeout(resolve, 100)),
                )
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            expect(result.current.isProcessing).toBe(false)

            const approvePromise = result.current.handleApprove()

            await waitFor(() => {
                expect(result.current.isProcessing).toBe(true)
            })

            await approvePromise

            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false)
            })
        })

        it('should call onOpportunityAccepted callback on success', async () => {
            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleApprove()

            await waitFor(() => {
                expect(
                    mockOpportunityConfig.onOpportunityAccepted,
                ).toHaveBeenCalledWith({
                    opportunityId: '123',
                    opportunityType: OpportunityType.FILL_KNOWLEDGE_GAP,
                })
            })
        })

        it('should submit acknowledge feedback when approving with knowledge service', async () => {
            const upsertFeedbackMock = jest.fn().mockResolvedValue({})
            ;(useUpsertFeedback as jest.Mock).mockReturnValue({
                mutateAsync: upsertFeedbackMock,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleApprove()

            await waitFor(() => {
                expect(upsertFeedbackMock).toHaveBeenCalledWith({
                    data: {
                        feedbackToUpsert: [
                            {
                                objectType: FeedbackObjectType.OPPORTUNITY,
                                objectId: '123',
                                executionId:
                                    '00000000-0000-0000-0000-000000000000',
                                targetType: FeedbackTargetType.OPPORTUNITY,
                                targetId: '123',
                                feedbackType:
                                    OpportunityFeedbackType.OPPORTUNITY_FREEFORM,
                                feedbackValue:
                                    'Knowledge gap opportunity was resolved by the merchant',
                            },
                        ],
                    },
                })
            })
        })
    })

    describe('handleResolve', () => {
        it('should call processOpportunity for conflict resolution', async () => {
            const mutateAsync = jest.fn().mockResolvedValue({})
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
                resources: [
                    {
                        title: 'Test Resource',
                        content: 'Test content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'res-1',
                            resourceSetId: 'set-1',
                            resourceLocale: 'en',
                            resourceVersion: '1.0',
                        },
                    },
                ],
            }

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: conflictOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleResolve()

            await waitFor(() => {
                expect(mutateAsync).toHaveBeenCalledWith(
                    expect.objectContaining({
                        shopIntegrationId: 456,
                        opportunityId: 123,
                        data: expect.objectContaining({
                            action: 'RESOLVE_CONFLICT',
                        }),
                    }),
                )
            })
        })
    })

    describe('handleDismiss', () => {
        it('should call processOpportunity with dismiss payload', async () => {
            const mutateAsync = jest.fn().mockResolvedValue({})
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const feedbackData = {
                feedbackToUpsert: [
                    {
                        objectId: '123',
                        objectType: 'OPPORTUNITY' as const,
                        executionId: '00000000-0000-0000-0000-000000000000',
                        targetType: 'OPPORTUNITY' as const,
                        targetId: '123',
                        feedbackValue: JSON.stringify({
                            category: 'test',
                            sentiment: 'negative',
                        }),
                        feedbackType: 'OPPORTUNITY_FREEFORM' as const,
                    },
                ],
            }

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleDismiss(feedbackData)

            await waitFor(() => {
                expect(mutateAsync).toHaveBeenCalledWith({
                    shopIntegrationId: 456,
                    opportunityId: 123,
                    data: expect.objectContaining({
                        action: 'DISMISS',
                    }),
                })
                expect(mockOpportunityConfig.onArchive).toHaveBeenCalledWith(
                    'ai_123',
                )
            })
        })

        it('should call onOpportunityDismissed callback on success', async () => {
            const feedbackData = {
                feedbackToUpsert: [],
            }

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleDismiss(feedbackData)

            await waitFor(() => {
                expect(
                    mockOpportunityConfig.onOpportunityDismissed,
                ).toHaveBeenCalledWith({
                    opportunityId: '123',
                    opportunityType: OpportunityType.FILL_KNOWLEDGE_GAP,
                })
            })
        })

        it('should not process when selectedOpportunity is null', async () => {
            const mutateAsync = jest.fn()
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: null,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleDismiss({ feedbackToUpsert: [] })

            expect(mutateAsync).not.toHaveBeenCalled()
        })
    })

    describe('isProcessing state', () => {
        it('should return false when not processing', () => {
            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            expect(result.current.isProcessing).toBe(false)
        })
    })

    describe('Error handling', () => {
        let mockDispatch: jest.Mock

        beforeEach(() => {
            mockDispatch = jest.fn()
            ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
        })

        it('should handle approval errors gracefully', async () => {
            const mutateAsync = jest
                .fn()
                .mockRejectedValue(new Error('API Error'))
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleApprove()

            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false)
            })
        })

        it('should handle dismiss errors gracefully', async () => {
            const mutateAsync = jest
                .fn()
                .mockRejectedValue(new Error('API Error'))
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleDismiss({ feedbackToUpsert: [] })

            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false)
            })
        })

        it('should show info notification for 409 conflict errors on approve', async () => {
            const conflictError = {
                response: {
                    status: 409,
                    data: {
                        error: {
                            msg: 'Resource has been modified',
                        },
                    },
                },
                isAxiosError: true,
            }
            const mutateAsync = jest.fn().mockRejectedValue(conflictError)
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleApprove()

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notify({
                        status: NotificationStatus.Info,
                        message:
                            'This opportunity is no longer relevant and was addressed by recent knowledge updates.',
                    }),
                )
            })
        })

        it('should show error notification for non-409 errors on approve', async () => {
            const genericError = {
                response: {
                    status: 500,
                    data: {
                        error: {
                            msg: 'Internal server error',
                        },
                    },
                },
                isAxiosError: true,
            }
            const mutateAsync = jest.fn().mockRejectedValue(genericError)
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleApprove()

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Failed to resolve knowledge gap. Please try again.',
                    }),
                )
            })
        })

        it('should report all errors to Sentry on approve', async () => {
            const error = new Error('API Error')
            const mutateAsync = jest.fn().mockRejectedValue(error)
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleApprove()

            await waitFor(() => {
                expect(reportError).toHaveBeenCalledWith(error, {
                    tags: { team: 'convai-knowledge' },
                    extra: {
                        context: 'Failed to resolve knowledge gap',
                        opportunityId: '123',
                    },
                })
            })
        })

        it('should show info notification for 409 conflict errors on resolve', async () => {
            const conflictError = {
                response: {
                    status: 409,
                    data: {
                        error: {
                            msg: 'Resource version mismatch',
                        },
                    },
                },
                isAxiosError: true,
            }
            const mutateAsync = jest.fn().mockRejectedValue(conflictError)
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
                resources: [
                    {
                        title: 'Test Resource',
                        content: 'Test content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'res-1',
                            resourceSetId: 'set-1',
                            resourceLocale: 'en',
                            resourceVersion: '1.0',
                        },
                    },
                ],
            }

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: conflictOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleResolve()

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notify({
                        status: NotificationStatus.Info,
                        message:
                            'This opportunity is no longer relevant and was addressed by recent knowledge updates.',
                    }),
                )
            })
        })

        it('should show info notification for 409 conflict errors on dismiss', async () => {
            const conflictError = {
                response: {
                    status: 409,
                    data: {
                        error: {
                            msg: 'Opportunity already processed',
                        },
                    },
                },
                isAxiosError: true,
            }
            const mutateAsync = jest.fn().mockRejectedValue(conflictError)
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: mockOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            await result.current.handleDismiss({ feedbackToUpsert: [] })

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notify({
                        status: NotificationStatus.Info,
                        message:
                            'This opportunity is no longer relevant and was addressed by recent knowledge updates.',
                    }),
                )
            })
        })

        it('should report errors to Sentry for all handlers', async () => {
            const error = new Error('Generic error')
            const mutateAsync = jest.fn().mockRejectedValue(error)
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
                resources: [
                    {
                        title: 'Test Resource',
                        content: 'Test content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'res-1',
                            resourceSetId: 'set-1',
                            resourceLocale: 'en',
                            resourceVersion: '1.0',
                        },
                    },
                ],
            }

            const { result } = renderHook(
                () =>
                    useOpportunityCTAs({
                        selectedOpportunity: conflictOpportunity,
                        editorFormResources: [mockFormData],
                        opportunityConfig: mockOpportunityConfig,
                    }),
                { wrapper },
            )

            // Test handleResolve
            await result.current.handleResolve()

            await waitFor(() => {
                expect(reportError).toHaveBeenCalledWith(error, {
                    tags: { team: 'convai-knowledge' },
                    extra: {
                        context: 'Failed to resolve conflict opportunity',
                        opportunityId: '123',
                    },
                })
            })

            // Clear mocks for next test
            jest.clearAllMocks()
            ;(useProcessOpportunity as jest.Mock).mockReturnValue({
                mutateAsync,
            })

            // Test handleDismiss
            await result.current.handleDismiss({ feedbackToUpsert: [] })

            await waitFor(() => {
                expect(reportError).toHaveBeenCalledWith(error, {
                    tags: { team: 'convai-knowledge' },
                    extra: {
                        context: 'Failed to dismiss opportunity',
                        opportunityId: '123',
                    },
                })
            })
        })
    })
})
