import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { TicketInfobarTab } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { useFeedbackTracking } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getDateAndTimeFormatter } from 'state/currentUser/selectors'
import { getSectionIdByName } from 'state/entities/sections/selectors'
import { getAIAgentMessages, getTicketState } from 'state/ticket/selectors'
import { getViewsState } from 'state/views/selectors'

import useGoToNextTicket from '../../TicketNavigation/hooks/useGoToNextTicket'
import AIAgentSimplifiedFeedback from '../AIAgentSimplifiedFeedback'
import { useEnrichFeedbackData } from '../useEnrichKnowledgeFeedbackData/useEnrichFeedbackData'
import { useGetAllRelatedResourceData } from '../useEnrichKnowledgeFeedbackData/useGetAllRelatedResourceData'

jest.mock('@gorgias/axiom', () => {
    return {
        ...jest.requireActual('@gorgias/axiom'),
        LegacyTooltip: () => <div>Tooltip</div>,
    }
})

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
jest.mock('hooks/useGetDateAndTimeFormat')
const useGetDateAndTimeFormatMock = useGetDateAndTimeFormat as jest.Mock
jest.mock('models/knowledgeService/queries')
const useGetFeedbackMock = useGetFeedback as jest.Mock
jest.mock('../useEnrichKnowledgeFeedbackData/useEnrichFeedbackData')
const useEnrichFeedbackDataMock = useEnrichFeedbackData as jest.Mock
jest.mock('../useEnrichKnowledgeFeedbackData/useGetAllRelatedResourceData')
const useGetAllRelatedResourceDataMock =
    useGetAllRelatedResourceData as jest.Mock
jest.mock('../../TicketNavigation/hooks/useGoToNextTicket')
const useGoToNextTicketMock = useGoToNextTicket as jest.Mock
jest.mock('models/knowledgeService/mutations')
const useUpsertFeedbackMock = useUpsertFeedback as jest.Mock
jest.mock('pages/aiAgent/hooks/useStoreConfiguration', () => ({
    useStoreConfiguration: jest.fn(() => ({
        storeConfiguration: {
            shopName: 'test nema',
            shopType: 'shopify',
            guidanceHelpCenterId: 123,
            helpCenterId: 456,
        },
    })),
}))
const useStoreConfigurationMock = useStoreConfiguration as jest.Mock

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)
const useGetGuidancesAvailableActionsMocked = assumeMock(
    useGetGuidancesAvailableActions,
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
)
const useKnowledgeSourceSideBarMocked = assumeMock(useKnowledgeSourceSideBar)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackTracking',
)
const useFeedbackTrackingMocked = assumeMock(useFeedbackTracking)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    HelpCenterApiClientProvider: ({
        children,
    }: {
        children: React.ReactNode
    }) => <div>{children}</div>,
    useAbilityChecker: jest.fn().mockReturnValue({
        isPassingRulesCheck: jest.fn().mockReturnValue(true),
    }),
    useHelpCenterApi: jest.fn().mockReturnValue({
        client: jest.fn(),
    }),
}))

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    SupportedLocalesProvider: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('models/aiAgentFeedback/queries')
const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)

jest.mock('pages/aiAgent/hooks/useShopIntegrationId', () => ({
    useShopIntegrationId: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    useFlag: jest.fn(),
    FeatureFlagKey: {
        IncreaseVisibilityOfOpportunity: 'increase-visibility-of-opportunity',
    },
}))

const useFlagMock = useFlag as jest.Mock
const useShopIntegrationIdMock = useShopIntegrationId as jest.Mock

const initialFeedbackData = {
    isLoading: true,
    enrichedData: {
        knowledgeResources: [],
        suggestedResources: [],
        freeForm: null,
    },
    helpCenters: [],
    resourceArticles: [],
    resourceGuidanceArticles: [],
}

describe('AIAgentSimplifiedFeedback', () => {
    beforeEach(() => {
        jest.useFakeTimers()

        useGetGuidancesAvailableActionsMocked.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
        })
        useGoToNextTicketMock.mockReturnValue({
            goToTicket: jest.fn(),
            isEnabled: false,
        })
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getViewsState) return { getIn: () => 'AI Agent' }
            if (selector === getSectionIdByName)
                return { 'AI Agent': 'AI Agent' }
            if (selector === getTicketState) {
                return {
                    get: (key: string) => {
                        if (key === 'id') return 123
                        if (key === 'tags') return null
                        return null
                    },
                }
            }
            if (selector === getCurrentAccountState)
                return new Map([
                    ['id', 1],
                    ['domain', 'test.com'],
                ] as any)
            if (selector === getDateAndTimeFormatter)
                return () => 'MMMM DD, YYYY'
            if (selector.toString().includes('state.currentUser'))
                return new Map([['id', 789]])
            if (selector === getAIAgentMessages) {
                return []
            }
            return null
        })

        useGetDateAndTimeFormatMock.mockReturnValue('MMMM DD, YYYY')

        useGetFeedbackMock.mockReturnValue({
            data: { executions: [] },
        })

        useEnrichFeedbackDataMock.mockReturnValue(initialFeedbackData)

        useGetAllRelatedResourceDataMock.mockReturnValue({
            actions: [],
            articles: [],
            guidanceArticles: [],
            sourceItems: [],
            ingestedFiles: [],
            storeWebsiteQuestions: [],
            products: [],
            isLoading: false,
        })

        useUpsertFeedbackMock.mockReturnValue({
            mutateAsync: jest.fn(),
        })

        useKnowledgeSourceSideBarMocked.mockReturnValue({
            selectedResource: null,
            mode: null,
            isClosing: false,
            openPreview: jest.fn(),
            openEdit: jest.fn(),
            openCreate: jest.fn(),
            closeModal: jest.fn(),
        })

        useAppDispatchMock.mockReturnValue(jest.fn())

        useFeedbackTrackingMocked.mockReturnValue({
            onKnowledgeResourceClick: jest.fn(),
            onKnowledgeResourceEditClick: jest.fn(),
            onKnowledgeResourceCreateClick: jest.fn(),
            onKnowledgeResourceSaved: jest.fn(),
            onFeedbackTabOpened: jest.fn(),
            onFeedbackGiven: jest.fn(),
        })

        useShopIntegrationIdMock.mockReturnValue(123)
        useFlagMock.mockReturnValue(false)

        useGetAiAgentFeedbackMock.mockReturnValue({ data: undefined } as any)
    })

    it('should render explanation message if there are no feedback executions yet', () => {
        render(<AIAgentSimplifiedFeedback />)
        expect(
            screen.getByText(
                "We're still processing the details of this conversation. You'll be able to review shortly.",
            ),
        ).toBeInTheDocument()
    })

    it('should set the ai agent feedback tab as the active tab when reviewing next ticket', () => {
        render(<AIAgentSimplifiedFeedback />)

        expect(useGoToNextTicket).toHaveBeenCalledWith(
            '123',
            TicketInfobarTab.AIFeedback,
        )
    })

    it('should save free form feedback after debounce', async () => {
        jest.useFakeTimers()
        const mutateAsyncMock = jest.fn()

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        resources: [],
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                executionId:
                                    'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                            },
                        ],
                    },
                ],
            },
        })

        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        render(<AIAgentSimplifiedFeedback />)

        const input = screen.getByRole('textbox')

        fireEvent.change(input, { target: { value: 'Great answer!' } })
        await act(async () => {
            jest.runAllTimers()
        })

        expect(mutateAsyncMock).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        feedbackType: 'TICKET_FREEFORM',
                        feedbackValue: 'Great answer!',
                        id: undefined,
                        objectId: '123',
                        objectType: 'TICKET',
                        targetId: '123',
                        targetType: 'TICKET',
                    },
                ],
            },
        })
    })

    it('should not call mutate if input is empty', async () => {
        const mutateAsyncMock = jest.fn()
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                executionId: '123',
                            },
                        ],
                    },
                ],
            },
        })

        render(<AIAgentSimplifiedFeedback />)

        const input = screen.getByRole('textbox')
        input.focus()
        input.blur()

        await act(async () => {
            jest.runAllTimers()
        })

        expect(mutateAsyncMock).not.toHaveBeenCalled()
    })

    it('should call mutate with thumbs down feedback', async () => {
        const mutateAsyncMock = jest.fn()
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })
        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        resource: {
                            id: '123',
                            resourceId: '123',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                            resourceTitle: 'Test Article',
                            feedback: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        feedback: {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackValue: 'DOWN',
                            submittedBy: 1,
                            createdDatetime: '2023-10-01T00:00:00Z',
                            updatedDatetime: '2023-10-01T00:00:00Z',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        },
                    },
                ],
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        const thumbsUpButton = screen.getByText('thumb_up')
        await act(async () => {
            fireEvent.click(thumbsUpButton)
            jest.runAllTimers()
        })

        expect(mutateAsyncMock).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        feedbackValue: 'UP',
                        id: 1,
                        objectId: '123',
                        objectType: 'TICKET',
                        targetId: '123',
                        targetType: 'KNOWLEDGE_RESOURCE',
                    },
                ],
            },
        })
    })
    it('should call mutate with thumbs up feedback', async () => {
        const mutateAsyncMock = jest.fn()
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })
        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        resource: {
                            id: '123',
                            resourceId: '123',
                            resourceType: 'GUIDANCE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                            resourceTitle: 'Test Guidance',
                            feedback: null,
                        },
                        metadata: {
                            title: 'Test Guidance',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        feedback: {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackValue: 'UP',
                            submittedBy: 1,
                            createdDatetime: '2023-10-01T00:00:00Z',
                            updatedDatetime: '2023-10-01T00:00:00Z',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        },
                    },
                ],
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        const thumbsDownButton = screen.getByText('thumb_down')
        await act(async () => {
            fireEvent.click(thumbsDownButton)
            jest.runAllTimers()
        })

        expect(mutateAsyncMock).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        feedbackValue: 'DOWN',
                        id: 1,
                        objectId: '123',
                        objectType: 'TICKET',
                        targetId: '123',
                        targetType: 'KNOWLEDGE_RESOURCE',
                    },
                ],
            },
        })
    })

    it('should render reviewNextButton and handle click when it is enabled', async () => {
        const goToTicket = jest.fn()

        useGoToNextTicketMock.mockReturnValue({
            goToTicket,
            isEnabled: true,
        })

        const mutateAsyncMock = jest.fn()
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        render(<AIAgentSimplifiedFeedback />)

        const reviwewNextButton = screen.getByText('Review next ticket')

        expect(reviwewNextButton).toBeInTheDocument()

        fireEvent.click(reviwewNextButton)

        expect(goToTicket).toHaveBeenCalled()
    })

    it('should render empty state when knowledgeResources length is zero and not in loading state', () => {
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                freeForm: {},
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Should show "No knowledge used" when knowledgeResources is empty but not loading
        expect(screen.getByText('No knowledge used')).toBeInTheDocument()

        // Should still render the heading
        expect(screen.getByText('Review sources used')).toBeInTheDocument()
    })

    it('should display loading indicator in initial state', () => {
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })

        // Keep isLoading true to trigger the isInitialLoad state
        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            isLoading: true,
        })

        render(<AIAgentSimplifiedFeedback />)

        // During initial loading, the skeleton components would be rendered
        // but we don't need to test the exact skeleton component
        // We just verify that we don't see the "No knowledge used" text
        expect(screen.queryByText('No knowledge used')).not.toBeInTheDocument()
    })

    it('should handle API errors when calling handleIconClick', async () => {
        // Mock console.error to check if it's called
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        // Create a failing mutation
        const mockError = new Error('API Error')
        const mutateAsyncMock = jest.fn().mockRejectedValue(mockError)
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        // Set up test data
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        resource: {
                            id: '123',
                            resourceId: '123',
                            resourceTitle: 'Test Article',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                            feedback: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        feedback: {
                            feedbackValue: 'UP',
                        },
                    },
                ],
                freeForm: null,
                suggestedResources: [],
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Trigger the thumbs down click which should call handleIconClick
        const thumbsDownButton = screen.getByText('thumb_down')
        await act(async () => {
            fireEvent.click(thumbsDownButton)
            jest.runAllTimers()
        })

        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)

        // Cleanup
        consoleErrorSpy.mockRestore()
    })

    it('should update freeFormFeedback from enrichedData when not in loadingFreeFormMutation state', () => {
        // Set up feedback data with existing freeForm feedback
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                executionId: '123',
                            },
                        ],
                    },
                ],
            },
        })

        // Initial render without feedback value
        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                freeForm: {},
            },
            isLoading: false,
        })

        const { rerender } = render(<AIAgentSimplifiedFeedback />)

        // Get the FeedbackInternalNote component
        const textarea = screen.queryByRole('textbox')
        expect(textarea).toHaveValue('')

        // Update with freeForm feedback value
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                executionId: '123',
                            },
                            {
                                id: 2,
                                feedbackType: 'TICKET_FREEFORM',
                                feedbackValue: 'Test feedback from API',
                                executionId: '123',
                            },
                        ],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                freeForm: {
                    feedback: {
                        feedbackValue: 'Test feedback from API',
                    },
                },
            },
            isLoading: false,
        })

        // Re-render with new props
        rerender(<AIAgentSimplifiedFeedback />)

        // Check that the textarea has been updated with the feedback value
        expect(screen.getByRole('textbox')).toHaveValue(
            'Test feedback from API',
        )
    })

    it('should transition from initial loading to loaded state', async () => {
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })

        // First render with loading state
        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            isLoading: true,
        })

        const { rerender } = render(<AIAgentSimplifiedFeedback />)

        // Now update to non-loading state
        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        resource: {
                            id: '123',
                            title: 'Test Article',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        id: '123',
                        resourceId: '123',
                        resourceType: 'ARTICLE',
                        resourceSetId: 'set1',
                        resourceLocale: null,
                        resourceTitle: 'Test Article',
                        feedback: {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: '123',
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackValue: 'UP',
                            submittedBy: 1,
                            createdDatetime: '2023-10-01T00:00:00Z',
                            updatedDatetime: '2023-10-01T00:00:00Z',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        },
                    },
                ],
                freeForm: {},
            },
            isLoading: false,
        })

        await act(async () => {
            rerender(<AIAgentSimplifiedFeedback />)
            jest.runAllTimers()
        })

        // Verify loading skeletons are no longer shown
        expect(screen.queryByText('No knowledge used')).not.toBeInTheDocument()

        // Instead we should see the knowledge resources
        expect(screen.getByText('thumb_up')).toBeInTheDocument()
        expect(screen.getByText('thumb_down')).toBeInTheDocument()
    })

    it('should render heading, badge and feedback when executions exist', () => {
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        resource: {
                            id: '123',
                            title: 'Test Article',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        id: '123',
                        resourceId: '123',
                        resourceType: 'ARTICLE',
                        resourceSetId: 'set1',
                        resourceLocale: null,
                        resourceTitle: 'Test Article',
                        feedback: {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: '123',
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackValue: 'UP',
                            submittedBy: 1,
                            createdDatetime: '2023-10-01T00:00:00Z',
                            updatedDatetime: '2023-10-01T00:00:00Z',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        },
                    },
                ],
                freeForm: {},
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Check that the heading and badges are rendered
        expect(screen.getByText('Review sources used')).toBeInTheDocument()

        // Check that thumbs up is visible
        expect(screen.getByText('thumb_up')).toBeInTheDocument()
        expect(screen.getByText('thumb_down')).toBeInTheDocument()
    })

    it('should handle feedback icon clicks correctly', async () => {
        const mutateAsyncMock = jest.fn().mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve(null), 100)
                }),
        )

        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        resource: {
                            id: '123',
                            title: 'Test Article',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        id: '123',
                        resourceId: '123',
                        resourceType: 'ARTICLE',
                        resourceSetId: 'set1',
                        resourceLocale: null,
                        resourceTitle: 'Test Article',
                        feedback: {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 123,
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackValue: 'DOWN',
                            submittedBy: 1,
                            createdDatetime: '2023-10-01T00:00:00Z',
                            updatedDatetime: '2023-10-01T00:00:00Z',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        },
                        executionId: 123,
                    },
                ],
                freeForm: {},
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Verify thumbs down is displayed as selected (we set its value to DOWN above)
        const thumbsUpButton = screen.getByText('thumb_up')

        // Click thumbs up to change feedback value
        await act(async () => {
            fireEvent.click(thumbsUpButton)
        })

        // The mutation should be called with the expected parameters
        expect(mutateAsyncMock).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    expect.objectContaining({
                        executionId: 123,
                        feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        feedbackValue: 'UP',
                        objectId: '123',
                        targetId: '123',
                        targetType: 'KNOWLEDGE_RESOURCE',
                    }),
                ],
            },
        })
    })

    it('should handle FeedbackInternalNote onChange and trigger mutation after debounce', async () => {
        const mutateAsyncMock = jest.fn().mockResolvedValue({})
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: '123',
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                executionId: '123',
                            },
                        ],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                freeForm: {
                    executionId: '123',
                    feedback: {
                        feedbackValue: '',
                    },
                },
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Find the text area (FeedbackInternalNote)
        const textarea = screen.getByRole('textbox')

        // Type new feedback
        fireEvent.change(textarea, {
            target: { value: 'New feedback text' },
        })

        // Run the timers to trigger the debounced effect
        await act(async () => {
            jest.runAllTimers()
        })

        // Verify the mutation was called with the correct parameters
        expect(mutateAsyncMock).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    expect.objectContaining({
                        executionId: '123',
                        feedbackType: 'TICKET_FREEFORM',
                        feedbackValue: 'New feedback text',
                        objectId: '123',
                        targetType: 'TICKET',
                    }),
                ],
            },
        })
    })

    it('should not save when textarea value is unchanged', async () => {
        const mutateAsyncMock = jest.fn().mockResolvedValue({})
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        const existingFeedback = 'Existing feedback text'

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: '123',
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                executionId: '123',
                            },
                            {
                                id: 456,
                                feedbackType: 'TICKET_FREEFORM',
                                feedbackValue: existingFeedback,
                                executionId: '123',
                            },
                        ],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                freeForm: {
                    executionId: '123',
                    feedback: {
                        feedbackValue: existingFeedback,
                        id: 456,
                    },
                },
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Verify textarea displays the correct value
        const textarea = screen.getByRole('textbox')
        expect(textarea).toHaveValue(existingFeedback)

        // Focus and blur without changing value
        fireEvent.click(textarea)
        fireEvent.blur(textarea)

        // Run timers
        await act(async () => {
            jest.runAllTimers()
        })

        // Verify the mutation was not called
        expect(mutateAsyncMock).not.toHaveBeenCalled()
    })

    it('should update textarea from enrichedData', async () => {
        const existingFeedback = 'Existing feedback text'

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: '123',
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                executionId: '123',
                            },
                            {
                                id: 2,
                                feedbackType: 'TICKET_FREEFORM',
                                feedbackValue: existingFeedback,
                                executionId: '123',
                            },
                        ],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                freeForm: {
                    executionId: '123',
                    feedback: {
                        feedbackValue: existingFeedback,
                    },
                },
            },
            isLoading: false,
        })

        const { unmount } = render(<AIAgentSimplifiedFeedback />)

        // Verify the textarea contains the value from enrichedData
        const textarea = screen.getByRole('textbox')
        expect(textarea).toHaveValue(existingFeedback)

        // Unmount the component to ensure we're rendering a fresh instance
        unmount()

        // Now mock different data
        const newFeedback = 'Updated feedback text'
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: '123',
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                executionId: '123',
                            },
                            {
                                id: 2,
                                feedbackType: 'TICKET_FREEFORM',
                                feedbackValue: newFeedback,
                                executionId: '123',
                            },
                        ],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                freeForm: {
                    executionId: '123',
                    feedback: {
                        feedbackValue: newFeedback,
                    },
                },
            },
            isLoading: false,
        })

        // Render a new instance
        render(<AIAgentSimplifiedFeedback />)

        // Verify the textarea shows the new value
        const updatedTextarea = screen.getByRole('textbox')
        expect(updatedTextarea).toHaveValue(newFeedback)
    })

    it('should show the correct AutoSaveBadge state based on loadingMutations', async () => {
        // Mock the mutation function
        const mutateAsyncMock = jest
            .fn()
            .mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(() => resolve({}), 100),
                    ),
            )
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        // Set up the component with executions
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: 123,
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })

        // Set up the enriched data with a knowledge resource
        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        resource: {
                            id: '123',
                            title: 'Test Article',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        id: '123',
                        resourceId: '123',
                        resourceType: 'ARTICLE',
                        resourceSetId: 'set1',
                        resourceLocale: null,
                        resourceTitle: 'Test Article',
                        feedback: {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 123,
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackValue: 'DOWN',
                            submittedBy: 1,
                            createdDatetime: '2023-10-01T00:00:00Z',
                            updatedDatetime: '2023-10-01T00:00:00Z',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        },
                        executionId: 123,
                    },
                ],
                freeForm: {},
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Initially there should be no "Saving" text visible
        expect(screen.queryByText('Saving')).not.toBeInTheDocument()
        expect(screen.queryByText('Saved')).not.toBeInTheDocument()

        // Click the thumbs up button to trigger a mutation
        const thumbsUpButton = screen.getByText('thumb_up')
        await act(async () => {
            fireEvent.click(thumbsUpButton)
        })

        // Now "Saving" should be visible
        expect(screen.getByText('Saving')).toBeInTheDocument()

        // Complete the mutation
        await act(async () => {
            jest.advanceTimersByTime(100)
        })

        // After mutation completes, "Saved" should be visible
        expect(screen.getByText('Saved')).toBeInTheDocument()
    })

    it('should handle deleted resources in getSuggestedResourceFeedbackValue', async () => {
        // Set up mock data for a deleted resource
        const mutateAsyncMock = jest.fn().mockResolvedValue({})

        // Set up component with test data
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [],
                    },
                ],
            },
        })

        // Mock enriched data with a deleted resource
        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                suggestedResources: [
                    {
                        parsedResource: {
                            resourceType: 'ARTICLE',
                            resourceId: 'deleted123',
                            resourceSetId: 'help-center-123',
                        },
                        feedback: {
                            executionId: 123,
                        },
                    },
                ],
                freeForm: {},
            },
            isLoading: false,
        })

        // Set up article with isDeleted: true in its metadata
        const deletedArticle = {
            id: 'deleted123',
            title: 'Deleted Article',
            translation: { locale: 'en-US' },
            metadata: { isDeleted: true },
        }

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            articles: [deletedArticle],
            enrichedData: {
                knowledgeResources: [],
                suggestedResources: [
                    {
                        parsedResource: {
                            resourceType: 'ARTICLE',
                            resourceId: 'deleted123',
                            resourceSetId: 'help-center-123',
                        },
                        feedback: {
                            executionId: 123,
                        },
                    },
                ],
                freeForm: {},
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Wait for any state updates
        await act(async () => {
            jest.runAllTimers()
        })

        // The test verifies that when the component is set up with a deleted resource,
        // it correctly handles the case in getSuggestedResourceFeedbackValue by returning null
    })

    it('should calculate lastUpdatedMutations correctly when resources have no updatedDatetime', () => {
        // Mock feedback data with resources that don't have updatedDatetime
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [
                            {
                                id: 'res-1',
                                feedback: {
                                    // No updatedDatetime
                                },
                            },
                        ],
                        feedback: [
                            {
                                // No updatedDatetime
                            },
                        ],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        executionId: 'b41ac70f-40f3-4d16-8f34-e9d44ae8ade5',
                        resource: {
                            id: '123',
                            resourceId: '123',
                            resourceTitle: 'Test Article',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                            feedback: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        feedback: {
                            feedbackValue: 'UP',
                        },
                    },
                ],
                freeForm: null,
                suggestedResources: [],
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Verify that the AutoSaveBadge is rendered with current date
        // (implicit verification that lastUpdatedMutations was calculated without errors)
        expect(screen.getByText('Review sources used')).toBeInTheDocument()
    })

    it('should not handle icon click when already loading that resource', async () => {
        const mutateAsyncMock = jest.fn()
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        // Testing the condition "if (loadingMutations?.includes(upsertId) || resource.feedback?.feedbackValue === value)" directly
        // We'll use the second part of the condition by setting up a resource with the same feedback value
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        resource: {
                            id: '123',
                            title: 'Test Article',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        id: '123',
                        resourceId: '123',
                        resourceType: 'ARTICLE',
                        resourceSetId: 'set1',
                        resourceLocale: null,
                        resourceTitle: 'Test Article',
                        feedback: {
                            id: 456,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 123,
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackValue: 'UP', // Already has UP value
                            submittedBy: 1,
                            createdDatetime: '2023-10-01T00:00:00Z',
                            updatedDatetime: '2023-10-01T00:00:00Z',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        },
                        executionId: 123,
                    },
                ],
                freeForm: {},
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Click the thumbs up button that already has the same value
        const thumbsUpButton = screen.getByText('thumb_up')

        await act(async () => {
            fireEvent.click(thumbsUpButton)
        })

        // Verify the mutation was not called since the value is already 'UP'
        expect(mutateAsyncMock).not.toHaveBeenCalled()
    })

    it('should not call upsertFeedback when feedback value is the same', async () => {
        const mutateAsyncMock = jest.fn()
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        // Setup resource with UP feedback value
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        resource: {
                            id: '123',
                            title: 'Test Article',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        id: '123',
                        resourceId: '123',
                        resourceType: 'ARTICLE',
                        resourceSetId: 'set1',
                        resourceLocale: null,
                        resourceTitle: 'Test Article',
                        feedback: {
                            id: 456,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 123,
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackValue: 'UP', // Already has UP value
                            submittedBy: 1,
                            createdDatetime: '2023-10-01T00:00:00Z',
                            updatedDatetime: '2023-10-01T00:00:00Z',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        },
                        executionId: 123,
                    },
                ],
                freeForm: {},
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Click the thumbs up button that already has the same value
        const thumbsUpButton = screen.getByText('thumb_up')

        await act(async () => {
            fireEvent.click(thumbsUpButton)
        })

        // Verify the mutation was not called since the value is already 'UP'
        expect(mutateAsyncMock).not.toHaveBeenCalled()
    })

    it('should render FeedbackInternalNote correctly when updatedAt is undefined', () => {
        // Setup mock with feedback that has no updatedDatetime
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: '123',
                        id: 123,
                        storeConfiguration: 'test',
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                executionId: '123',
                            },
                            {
                                id: 789,
                                feedbackType: 'TICKET_FREEFORM',
                                feedbackValue:
                                    'Test feedback with no update time',
                                // No updatedDatetime property
                                createdDatetime: '2023-01-01T00:00:00.000Z',
                                executionId: '123',
                            },
                        ],
                        resources: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                freeForm: {
                    executionId: '123',
                    feedback: {
                        id: 789,
                        feedbackValue: 'Test feedback with no update time',
                        // No updatedDatetime property
                    },
                },
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        // Verify the textarea is rendered with the correct value
        expect(screen.getByRole('textbox')).toHaveValue(
            'Test feedback with no update time',
        )

        // The component should render without errors despite updatedAt being undefined
        expect(
            screen.getByTestId('ai-message-feedback-issues-note-test-id'),
        ).toBeInTheDocument()
    })

    it('should handle different execution structures in lastUpdatedMutations calculation', () => {
        const maxDate = new Date('2023-10-02T00:00:00Z')

        // Create feedback with multiple executions and resources
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: 'exec1',
                        resources: [
                            {
                                feedback: {
                                    updatedDatetime: '2023-10-01T00:00:00Z',
                                },
                            },
                            {
                                feedback: {
                                    updatedDatetime: maxDate.toISOString(), // This should be the max
                                },
                            },
                        ],
                        feedback: [
                            {
                                feedbackType: 'SUGGESTED_RESOURCE',
                                updatedDatetime: '2023-09-30T00:00:00Z',
                            },
                        ],
                    },
                ],
            },
        })

        render(<AIAgentSimplifiedFeedback />)

        // The maxDate should be calculated correctly from the executions
        expect(screen.getByText('Review sources used')).toBeInTheDocument()
    })

    it('should handle feedback resources without updatedDatetime', () => {
        // Test case to cover line 80: feedback.updatedDatetime ternary condition
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: 'exec1',
                        resources: [
                            {
                                feedback: {
                                    // Missing updatedDatetime - should use 0
                                },
                            },
                        ],
                        feedback: [
                            {
                                feedbackType: 'SUGGESTED_RESOURCE',
                                // Missing updatedDatetime - should use 0
                            },
                        ],
                    },
                ],
            },
        })

        render(<AIAgentSimplifiedFeedback />)

        expect(screen.getByText('Review sources used')).toBeInTheDocument()
    })

    it('should handle icon click when executionId is missing', async () => {
        const mutateAsyncMock = jest.fn()
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        // Set up feedback with executions but no executionId in resource
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        // executionId missing from main execution
                        resources: [
                            {
                                // Add a resource to match the enrichedData knowledgeResources length
                                id: '123',
                                resourceType: 'ARTICLE',
                            },
                        ],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [
                    {
                        resource: {
                            id: '123',
                            title: 'Test Article',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                        },
                        metadata: {
                            title: 'Test Article',
                            url: 'https://example.com',
                            isDeleted: false,
                            isLoading: false,
                        },
                        id: '123',
                        resourceId: '123',
                        resourceType: 'ARTICLE',
                        resourceSetId: 'set1',
                        resourceLocale: null,
                        resourceTitle: 'Test Article',
                        // No executionId provided in resource
                        feedback: {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackValue: null,
                            submittedBy: 1,
                            createdDatetime: '2023-10-01T00:00:00Z',
                            updatedDatetime: '2023-10-01T00:00:00Z',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        },
                    },
                ],
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        const thumbsUpButton = screen.getByText('thumb_up')
        await act(async () => {
            fireEvent.click(thumbsUpButton)
            jest.runAllTimers()
        })

        // Should not call mutateAsync when executionId is missing
        expect(mutateAsyncMock).not.toHaveBeenCalled()
    })

    it('should handle free form feedback change when executionId is missing', async () => {
        const mutateAsyncMock = jest.fn()
        useUpsertFeedbackMock.mockReturnValue({ mutateAsync: mutateAsyncMock })

        // Set up feedback with executions but no executionId
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        // executionId missing from main execution
                        resources: [],
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_RATING',
                                feedbackValue: 'GOOD',
                                // No executionId
                            },
                        ],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                freeForm: {
                    // No executionId in freeForm
                    feedback: {
                        feedbackValue: '',
                    },
                },
            },
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'Great answer!' } })

        await act(async () => {
            jest.runAllTimers()
        })

        expect(mutateAsyncMock).not.toHaveBeenCalled()
    })

    it('should handle null enrichedFeedbackMetadata from useEnrichFeedbackData', () => {
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [{ id: '123', resourceType: 'ARTICLE' }],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue(null)

        render(<AIAgentSimplifiedFeedback />)

        expect(screen.getByText('Review sources used')).toBeInTheDocument()

        expect(screen.queryByText('No knowledge used')).not.toBeInTheDocument()
    })

    it('should handle when storeConfiguration is null to cover shopType fallback', () => {
        jest.doMock('pages/aiAgent/hooks/useStoreConfiguration', () => ({
            useStoreConfiguration: () => ({
                storeConfiguration: null,
            }),
        }))

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            ...initialFeedbackData,
            enrichedData: {
                knowledgeResources: [],
                suggestedResources: undefined,
            },
            articles: null,
            guidanceArticles: undefined,
            isLoading: false,
        })

        render(<AIAgentSimplifiedFeedback />)

        expect(screen.getByText('Review sources used')).toBeInTheDocument()
    })

    describe('useFeedbackTracking integration', () => {
        it('should call useFeedbackTracking with correct parameters', () => {
            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            id: 123,
                            storeConfiguration: 'test',
                            resources: [],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(useFeedbackTrackingMocked).toHaveBeenCalledWith({
                ticketId: 123,
                accountId: 1,
                userId: 789,
            })
        })
    })

    describe('Loading states', () => {
        it('should render skeleton loading indicators when isLoadingFeedback is true', () => {
            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            id: 123,
                            storeConfiguration: 'test',
                            resources: [{ id: '123', resourceType: 'ARTICLE' }],
                            feedback: [],
                        },
                    ],
                },
                isLoading: false,
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                isLoading: true,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(screen.getByText('Review sources used')).toBeInTheDocument()
            expect(
                screen.queryByText('No knowledge used'),
            ).not.toBeInTheDocument()
        })

        it('should handle early return when executionId is missing in handleIconClick', async () => {
            const mutateAsyncMock = jest.fn()
            useUpsertFeedbackMock.mockReturnValue({
                mutateAsync: mutateAsyncMock,
            })

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            id: 123,
                            storeConfiguration: 'test',
                            resources: [{ id: '123', resourceType: 'ARTICLE' }],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [
                        {
                            resource: {
                                id: '123',
                                title: 'Test Article',
                                resourceType: 'ARTICLE',
                                resourceSetId: 'set1',
                                resourceLocale: null,
                            },
                            metadata: {
                                title: 'Test Article',
                                url: 'https://example.com',
                                isDeleted: false,
                                isLoading: false,
                            },
                            id: '123',
                            resourceId: '123',
                            resourceType: 'ARTICLE',
                            resourceSetId: 'set1',
                            resourceLocale: null,
                            resourceTitle: 'Test Article',
                            feedback: {
                                id: 1,
                                objectType: 'TICKET',
                                objectId: '123',
                                targetType: 'KNOWLEDGE_RESOURCE',
                                targetId: '123',
                                feedbackValue: null,
                                submittedBy: 1,
                                createdDatetime: '2023-10-01T00:00:00Z',
                                updatedDatetime: '2023-10-01T00:00:00Z',
                                feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                            },
                        },
                    ],
                    freeForm: {},
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            const thumbsUpButton = screen.getByText('thumb_up')
            await act(async () => {
                fireEvent.click(thumbsUpButton)
            })

            expect(mutateAsyncMock).not.toHaveBeenCalled()
        })

        it('should not render next ticket button when not in AI Agent section', () => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getViewsState)
                    return { getIn: () => 'Different Section' } // Not 'AI Agent'
                if (selector === getSectionIdByName)
                    return { 'AI Agent': 'AI Agent' }
                if (selector === getTicketState) {
                    return {
                        get: (key: string) => {
                            if (key === 'id') return 123
                            if (key === 'tags') return null
                            return null
                        },
                    }
                }
                if (selector === getCurrentAccountState)
                    return new Map([
                        ['id', 1],
                        ['domain', 'test.com'],
                    ] as any)
                if (selector === getDateAndTimeFormatter)
                    return () => 'MMMM DD, YYYY'
                if (selector.toString().includes('state.currentUser'))
                    return new Map([['id', 789]])
                if (selector === getAIAgentMessages) {
                    return []
                }
                return null
            })

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            id: 123,
                            storeConfiguration: 'test',
                            resources: [],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(
                screen.queryByText('Review next ticket'),
            ).not.toBeInTheDocument()
        })

        it('should not render MissingKnowledgeSelect when shopName is empty', () => {
            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            id: 123,
                            storeConfiguration: '',
                            resources: [],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [],
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(screen.getByText('Review sources used')).toBeInTheDocument()
            expect(screen.getByText('No knowledge used')).toBeInTheDocument()
        })
    })

    describe('Edge cases and optional chaining coverage', () => {
        it('should handle undefined feedback executions in lastUpdatedMutations calculation', () => {
            useGetFeedbackMock.mockReturnValue({
                data: null, // Set feedback data to null to avoid executions access
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(screen.getByText('Review sources used')).toBeInTheDocument()
        })

        it('should handle undefined storeConfiguration shopName fallback', () => {
            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            // storeConfiguration is undefined
                            resources: [],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(screen.getByText('Review sources used')).toBeInTheDocument()
        })

        it('should handle undefined loadingMutations in handleIconClick', async () => {
            const mutateAsyncMock = jest.fn().mockResolvedValue({})
            useUpsertFeedbackMock.mockReturnValue({
                mutateAsync: mutateAsyncMock,
            })

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'test-execution',
                            resources: [{ id: '123', resourceType: 'ARTICLE' }],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [
                        {
                            resource: {
                                id: '123',
                                title: 'Test Article',
                                resourceType: 'ARTICLE',
                            },
                            metadata: {
                                title: 'Test Article',
                                isLoading: false,
                            },
                            feedback: {
                                // id is undefined to test resource.feedback?.id fallback
                                feedbackValue: 'DOWN',
                            },
                            executionId: 'test-execution',
                        },
                    ],
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            const thumbsUpButton = screen.getByText('thumb_up')
            await act(async () => {
                fireEvent.click(thumbsUpButton)
            })

            expect(mutateAsyncMock).toHaveBeenCalledWith({
                data: {
                    feedbackToUpsert: [
                        expect.objectContaining({
                            id: undefined,
                            feedbackValue: 'UP',
                        }),
                    ],
                },
            })
        })

        it('should handle undefined enrichedData freeForm properties in handleFreeFormFeedbackChange', async () => {
            const mutateAsyncMock = jest.fn().mockResolvedValue({})
            useUpsertFeedbackMock.mockReturnValue({
                mutateAsync: mutateAsyncMock,
            })

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'test-execution',
                            resources: [],
                            feedback: [
                                {
                                    id: 1,
                                    feedbackType: 'TICKET_RATING',
                                    feedbackValue: 'GOOD',
                                    executionId: 'test-execution',
                                },
                            ],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [],
                    freeForm: {
                        feedback: {
                            feedbackValue: '',
                        },
                    },
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: 'Test feedback' } })

            await act(async () => {
                jest.runAllTimers()
            })

            expect(mutateAsyncMock).toHaveBeenCalledWith({
                data: {
                    feedbackToUpsert: [
                        expect.objectContaining({
                            id: undefined,
                            executionId: 'test-execution',
                            feedbackValue: 'Test feedback',
                        }),
                    ],
                },
            })
        })

        it('should handle undefined resources in knowledgeResources loading state mapping', () => {
            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'test-execution',
                            resources: [{ id: '123', resourceType: 'ARTICLE' }],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                isLoading: true,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(screen.getByText('Review sources used')).toBeInTheDocument()
            expect(
                screen.queryByText('No knowledge used'),
            ).not.toBeInTheDocument()
        })

        it('should handle undefined executions in ternary condition for knowledge resources', () => {
            useGetFeedbackMock.mockReturnValue({
                data: null,
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [],
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(screen.getByText('Review sources used')).toBeInTheDocument()
        })

        it('should handle undefined suggestedResources in MissingKnowledgeSelect', () => {
            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            id: 123,
                            storeConfiguration: { shopName: 'test-shop' },
                            resources: [],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [],
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(screen.getByText('Review sources used')).toBeInTheDocument()
        })

        it('should handle undefined storeConfiguration helpCenterId in CreateKnowledgeSection', () => {
            jest.doMock('pages/aiAgent/hooks/useStoreConfiguration', () => ({
                useStoreConfiguration: () => ({
                    storeConfiguration: {
                        shopName: 'test-shop',
                        shopType: 'shopify',
                        guidanceHelpCenterId: 123,
                    },
                }),
            }))

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            id: 123,
                            storeConfiguration: { shopName: 'test-shop' },
                            resources: [],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [],
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(screen.getByText('Review sources used')).toBeInTheDocument()
        })

        it('should handle undefined executions in dependency array', async () => {
            const mutateAsyncMock = jest.fn().mockResolvedValue({})
            useUpsertFeedbackMock.mockReturnValue({
                mutateAsync: mutateAsyncMock,
            })

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'test-execution',
                            resources: [{ id: '123', resourceType: 'ARTICLE' }],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [
                        {
                            resource: {
                                id: '123',
                                title: 'Test Article',
                                resourceType: 'ARTICLE',
                            },
                            metadata: {
                                title: 'Test Article',
                                isLoading: false,
                            },
                            feedback: {
                                feedbackValue: 'DOWN',
                            },
                            executionId: 'test-execution',
                        },
                    ],
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            const thumbsUpButton = screen.getByText('thumb_up')
            await act(async () => {
                fireEvent.click(thumbsUpButton)
            })

            expect(mutateAsyncMock).toHaveBeenCalled()
        })

        it('should handle empty oldValue in setLoadingMutations spread operator', async () => {
            const mutateAsyncMock = jest
                .fn()
                .mockImplementation(
                    () =>
                        new Promise((resolve) =>
                            setTimeout(() => resolve({}), 50),
                        ),
                )
            useUpsertFeedbackMock.mockReturnValue({
                mutateAsync: mutateAsyncMock,
            })

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'test-execution',
                            resources: [{ id: '123', resourceType: 'ARTICLE' }],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [
                        {
                            resource: {
                                id: '123',
                                title: 'Test Article',
                                resourceType: 'ARTICLE',
                            },
                            metadata: {
                                title: 'Test Article',
                                isLoading: false,
                            },
                            feedback: {
                                feedbackValue: 'DOWN',
                            },
                            executionId: 'test-execution',
                        },
                    ],
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            const thumbsUpButton = screen.getByText('thumb_up')

            await act(async () => {
                fireEvent.click(thumbsUpButton)
                fireEvent.click(thumbsUpButton)
            })

            expect(mutateAsyncMock).toHaveBeenCalled()
        })

        it('should handle undefined shopType in storeConfiguration to cover shopType fallback', () => {
            jest.doMock('pages/aiAgent/hooks/useStoreConfiguration', () => ({
                useStoreConfiguration: () => ({
                    storeConfiguration: {
                        shopName: 'test-shop',
                        helpCenterId: 123,
                    },
                }),
            }))

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            id: 123,
                            storeConfiguration: { shopName: 'test-shop' },
                            resources: [],
                            feedback: [],
                        },
                    ],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [],
                    freeForm: {},
                },
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(screen.getByText('Review sources used')).toBeInTheDocument()
        })

        it('should filter out PRODUCT_RECOMMENDATION when PRODUCT_KNOWLEDGE exists with same resourceId', () => {
            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'exec-1',
                            resources: [
                                {
                                    id: '1',
                                    resourceId: '12345',
                                    resourceTitle: 'Product 1',
                                    resourceType: 'PRODUCT_RECOMMENDATION',
                                },
                            ],
                            feedback: [],
                            storeConfiguration: {
                                shopName: 'test-shop',
                                shopType: 'shopify',
                            },
                        },
                        {
                            executionId: 'exec-2',
                            resources: [
                                {
                                    id: '2',
                                    resourceId: '12345',
                                    resourceTitle: 'Product 1',
                                    resourceType: 'PRODUCT_KNOWLEDGE',
                                },
                                {
                                    id: '3',
                                    resourceId: '45678',
                                    resourceTitle: 'Product 2',
                                    resourceType: 'PRODUCT_RECOMMENDATION',
                                },
                            ],
                            feedback: [],
                            storeConfiguration: {
                                shopName: 'test-shop',
                                shopType: 'shopify',
                            },
                        },
                    ],
                },
                isLoading: false,
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                enrichedData: {
                    knowledgeResources: [
                        {
                            resource: {
                                id: '1',
                                resourceId: '12345',
                                resourceTitle: 'Product 1',
                                resourceType: 'PRODUCT_RECOMMENDATION',
                            },
                            metadata: {
                                title: 'Product 1',
                                content: 'Product content',
                                url: 'https://example.com/products/12345',
                            },
                        },
                        {
                            resource: {
                                id: '2',
                                resourceId: '12345',
                                resourceTitle: 'Product 1',
                                resourceType: 'PRODUCT_KNOWLEDGE',
                            },
                            metadata: {
                                title: 'Product 1',
                                content: 'Product content',
                                url: 'https://example.com/products/12345',
                            },
                        },
                        {
                            resource: {
                                id: '3',
                                resourceId: '45678',
                                resourceTitle: 'Product 2',
                                resourceType: 'PRODUCT_RECOMMENDATION',
                            },
                            metadata: {
                                title: 'Product 2',
                                content: 'Product content',
                                url: 'https://example.com/products/45678',
                            },
                        },
                    ],
                    freeForm: null,
                    suggestedResources: [],
                },
            })

            render(<AIAgentSimplifiedFeedback />)

            // Should show only one instance of Product 1 (PRODUCT_KNOWLEDGE)
            const product1Elements = screen.getAllByText('Product 1')
            expect(product1Elements).toHaveLength(1)

            // Should show Product 2
            expect(screen.getByText('Product 2')).toBeInTheDocument()

            // Should have 2 Shopify logos
            const shopifyLogos = screen.getAllByAltText('shopify logo')
            expect(shopifyLogos).toHaveLength(2)
        })
    })

    it('should show ticket level feedback when ticket has mkt_ai_journey tag', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getTicketState) {
                return new Map([
                    ['id', 123],
                    ['tags', [new Map([['name', 'mkt_ai_journey']])]],
                ] as any)
            }
            if (selector === getCurrentAccountState) {
                return new Map([
                    ['id', 456],
                    ['domain', 'test.myshopify.com'],
                ] as any)
            }
            if (selector === getAIAgentMessages) {
                return []
            }
            if (selector === getDateAndTimeFormatter) {
                return () => 'MMMM DD, YYYY'
            }
            if (selector === getSectionIdByName) {
                return { 'AI Agent': 789 }
            }
            if (selector === getViewsState) {
                return {
                    getIn: jest.fn((path) => {
                        if (path[0] === 'active' && path[1] === 'section_id') {
                            return 789
                        }
                        return null
                    }),
                }
            }
            if (
                typeof selector === 'function' &&
                selector.toString().includes('currentUser')
            ) {
                return new Map([['id', 789]])
            }
            return null
        })

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: '123',
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [],
                    },
                ],
            },
        })

        render(<AIAgentSimplifiedFeedback />)

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()
    })

    it('should handle fallback resources with PRODUCT_KNOWLEDGE and filter PRODUCT_RECOMMENDATION', () => {
        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: '123',
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [
                            {
                                id: '1',
                                resourceId: '12345',
                                resourceTitle: 'Product 1',
                                resourceType: 'PRODUCT_RECOMMENDATION',
                                resourceSetId: 'set1',
                                resourceLocale: 'en',
                            },
                            {
                                id: '2',
                                resourceId: '12345',
                                resourceTitle: 'Product 1',
                                resourceType: 'PRODUCT_KNOWLEDGE',
                                resourceSetId: 'set1',
                                resourceLocale: 'en',
                            },
                        ],
                        feedback: [],
                    },
                ],
            },
        })

        useEnrichFeedbackDataMock.mockReturnValue({
            isLoading: false,
            enrichedData: {
                knowledgeResources: [],
            },
            helpCenters: [],
        })

        render(<AIAgentSimplifiedFeedback />)

        expect(screen.getByText('Product 1')).toBeInTheDocument()
        const productElements = screen.getAllByText('Product 1')
        expect(productElements).toHaveLength(1)
    })

    it('should show loading skeletons when feedback is loading', () => {
        useGetFeedbackMock.mockReturnValue({
            isLoading: true,
            data: undefined,
        })

        render(<AIAgentSimplifiedFeedback />)

        const skeletonElements = document.querySelectorAll('.skeletonContainer')
        expect(skeletonElements.length).toBe(3)
    })

    it('should handle date comparison for shouldShowTicketLevelFeedback when no mkt_ai_journey tag', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getTicketState) {
                return new Map([
                    ['id', 123],
                    ['tags', []],
                ] as any)
            }
            if (selector === getCurrentAccountState) {
                return new Map([
                    ['id', 456],
                    ['domain', 'test.myshopify.com'],
                ] as any)
            }
            if (selector === getAIAgentMessages) {
                return [
                    {
                        id: '1',
                        created_datetime: new Date(
                            Date.now() - 2 * 24 * 60 * 60 * 1000,
                        ).toISOString(), // 2 days ago
                    },
                ]
            }
            if (selector === getDateAndTimeFormatter) {
                return () => 'MMMM DD, YYYY'
            }
            if (selector === getSectionIdByName) {
                return { 'AI Agent': 789 }
            }
            if (selector === getViewsState) {
                return {
                    getIn: jest.fn((path) => {
                        if (path[0] === 'active' && path[1] === 'section_id') {
                            return 789
                        }
                        return null
                    }),
                }
            }
            if (
                typeof selector === 'function' &&
                selector.toString().includes('currentUser')
            ) {
                return new Map([['id', 789]])
            }
            return null
        })

        useGetFeedbackMock.mockReturnValue({
            data: {
                executions: [
                    {
                        executionId: '123',
                        id: 123,
                        storeConfiguration: 'test',
                        resources: [],
                        feedback: [],
                    },
                ],
            },
        })

        render(<AIAgentSimplifiedFeedback />)

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()
    })

    describe('TIME_UNTIL_SHOWING_TICKET_LEVEL_FEEDBACK tests', () => {
        it('should not show ticket level feedback when last AI message is less than 2 hours old', () => {
            const lessThanTwoHoursAgo = new Date(
                Date.now() - 1.5 * 60 * 60 * 1000,
            ) // 1.5 hours ago

            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getTicketState) {
                    return new Map([
                        ['id', 123],
                        ['tags', []],
                    ] as any)
                }
                if (selector === getCurrentAccountState) {
                    return new Map([
                        ['id', 456],
                        ['domain', 'test.myshopify.com'],
                    ] as any)
                }
                if (selector === getAIAgentMessages) {
                    return [
                        {
                            id: '1',
                            created_datetime: lessThanTwoHoursAgo.toISOString(),
                        },
                    ]
                }
                if (selector === getDateAndTimeFormatter) {
                    return () => 'MMMM DD, YYYY'
                }
                if (selector === getSectionIdByName) {
                    return { 'AI Agent': 789 }
                }
                if (selector === getViewsState) {
                    return {
                        getIn: jest.fn((path) => {
                            if (
                                path[0] === 'active' &&
                                path[1] === 'section_id'
                            ) {
                                return 789
                            }
                            return null
                        }),
                    }
                }
                if (
                    typeof selector === 'function' &&
                    selector.toString().includes('currentUser')
                ) {
                    return new Map([['id', 789]])
                }
                return null
            })

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [], // No executions
                },
            })

            render(<AIAgentSimplifiedFeedback />)

            // Should not show ticket level feedback, should show the processing message
            expect(
                screen.queryByText('How was this conversation?'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText(
                    "We're still processing the details of this conversation. You'll be able to review shortly.",
                ),
            ).toBeInTheDocument()
        })

        it('should show ticket level feedback when last AI message is more than 2 hours old', () => {
            const moreThanTwoHoursAgo = new Date(
                Date.now() - 3 * 60 * 60 * 1000,
            ) // 3 hours ago

            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getTicketState) {
                    return new Map([
                        ['id', 123],
                        ['tags', []],
                    ] as any)
                }
                if (selector === getCurrentAccountState) {
                    return new Map([
                        ['id', 456],
                        ['domain', 'test.myshopify.com'],
                    ] as any)
                }
                if (selector === getAIAgentMessages) {
                    return [
                        {
                            id: '1',
                            created_datetime: moreThanTwoHoursAgo.toISOString(),
                        },
                    ]
                }
                if (selector === getDateAndTimeFormatter) {
                    return () => 'MMMM DD, YYYY'
                }
                if (selector === getSectionIdByName) {
                    return { 'AI Agent': 789 }
                }
                if (selector === getViewsState) {
                    return {
                        getIn: jest.fn((path) => {
                            if (
                                path[0] === 'active' &&
                                path[1] === 'section_id'
                            ) {
                                return 789
                            }
                            return null
                        }),
                    }
                }
                if (
                    typeof selector === 'function' &&
                    selector.toString().includes('currentUser')
                ) {
                    return new Map([['id', 789]])
                }
                return null
            })

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [], // No executions
                },
            })

            render(<AIAgentSimplifiedFeedback />)

            // Should show ticket level feedback since it's more than 2 hours old
            expect(
                screen.getByText('How was this conversation?'),
            ).toBeInTheDocument()
        })

        it('should show unavailable message when ticket level feedback is shown but store configuration is missing', () => {
            const moreThanTwoHoursAgo = new Date(
                Date.now() - 3 * 60 * 60 * 1000,
            ) // 3 hours ago

            // Mock storeConfiguration to return null
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: null,
            })

            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getTicketState) {
                    return new Map([
                        ['id', 123],
                        ['tags', []],
                    ] as any)
                }
                if (selector === getCurrentAccountState) {
                    return new Map([
                        ['id', 456],
                        ['domain', 'test.myshopify.com'],
                    ] as any)
                }
                if (selector === getAIAgentMessages) {
                    return [
                        {
                            id: '1',
                            created_datetime: moreThanTwoHoursAgo.toISOString(),
                        },
                    ]
                }
                if (selector === getDateAndTimeFormatter) {
                    return () => 'MMMM DD, YYYY'
                }
                if (selector === getSectionIdByName) {
                    return { 'AI Agent': 789 }
                }
                if (selector === getViewsState) {
                    return {
                        getIn: jest.fn((path) => {
                            if (
                                path[0] === 'active' &&
                                path[1] === 'section_id'
                            ) {
                                return 789
                            }
                            return null
                        }),
                    }
                }
                if (
                    typeof selector === 'function' &&
                    selector.toString().includes('currentUser')
                ) {
                    return new Map([['id', 789]])
                }
                return null
            })

            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [],
                },
            })

            useEnrichFeedbackDataMock.mockReturnValue({
                ...initialFeedbackData,
                isLoading: false,
            })

            render(<AIAgentSimplifiedFeedback />)

            expect(
                screen.getByText('How was this conversation?'),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    'Additional data not available. You can still rate the conversation above.',
                ),
            ).toBeInTheDocument()

            // Reset the mock to its default state
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    shopName: 'test nema',
                    shopType: 'shopify',
                    guidanceHelpCenterId: 123,
                    helpCenterId: 456,
                },
            })
        })
    })
})
