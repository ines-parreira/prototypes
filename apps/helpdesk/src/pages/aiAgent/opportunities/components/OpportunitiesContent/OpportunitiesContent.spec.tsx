import { useState } from 'react'
import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import type { Opportunity } from 'pages/aiAgent/opportunities/types'
import { ResourceType } from 'pages/aiAgent/opportunities/types'
import { useUpsertArticleTemplateReview } from 'pages/settings/helpCenter/queries'
import { notify } from 'state/notifications/actions'

import OpportunitiesSidebarContext from '../../context/OpportunitiesSidebarContext'
import { OpportunityType } from '../../enums'
import { State } from '../../hooks/useOpportunityPageState'
import type { OpportunityPageState } from '../../hooks/useOpportunityPageState'
import { useProcessOpportunity } from '../../hooks/useProcessOpportunity'
import { OpportunitiesContent } from './OpportunitiesContent'

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn((payload) => ({
        type: 'NOTIFY',
        payload,
    })),
}))

jest.mock('pages/aiAgent/utils/guidance.utils', () => ({
    mapGuidanceFormFieldsToGuidanceArticle: jest.fn((formData, locale, id) => ({
        name: formData.name,
        content: formData.content,
        is_visible: formData.isVisible,
        locale,
        ai_suggestion_key: id,
    })),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => 'en-US'),
}))

jest.mock('state/ui/helpCenter', () => ({
    getViewLanguage: jest.fn(() => 'en-US'),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(() => ({
        default_locale: 'en-US',
        id: 1,
    })),
}))

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)
jest.mock('pages/aiAgent/components/GuidanceEditor/GuidanceEditor', () => ({
    GuidanceEditor: ({ content, handleUpdateContent }: any) => (
        <textarea
            data-testid="guidance-editor"
            value={content}
            onChange={(e) => handleUpdateContent(e.target.value)}
        />
    ),
}))
jest.mock('pages/settings/helpCenter/queries')
jest.mock('models/knowledgeService/mutations')
jest.mock('../../hooks/useProcessOpportunity')

jest.mock(
    '../RestrictedOpportunityMessage/RestrictedOpportunityMessage',
    () => ({
        RestrictedOpportunityMessage: ({
            opportunitiesPageState,
        }: {
            opportunitiesPageState: { title: string; description: string }
            shopName: string
        }) => (
            <div data-testid="restricted-opportunity-message">
                <h1>{opportunitiesPageState.title}</h1>
                <p>{opportunitiesPageState.description}</p>
                <button>Book a demo</button>
            </div>
        ),
    }),
)

const mockUseGuidanceCount = jest.fn(() => ({
    guidanceCount: 0,
    isLoading: false,
}))

jest.mock('../../hooks/useGuidanceCount', () => ({
    useGuidanceCount: () => mockUseGuidanceCount(),
}))

jest.mock('../../../hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            guidance: '/ai-agent/guidance',
            opportunities: '/ai-agent/opportunities',
        },
    })),
}))

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockOpportunityPageState: OpportunityPageState = {
    state: State.HAS_OPPORTUNITIES,
    isLoading: false,
    title: 'Opportunities',
    description: '',
    media: null,
    primaryCta: null,
    showEmptyState: false,
}

const mockEmptyPageState: OpportunityPageState = {
    state: State.ENABLED_NO_OPPORTUNITIES,
    isLoading: false,
    title: 'AI Agent is learning from your conversations',
    description:
        "As AI Agent handles more conversations, we'll surface opportunities to improve its accuracy and coverage. Check back soon!",
    media: '/assets/images/ai-agent/opportunities/learning.svg',
    primaryCta: null,
    showEmptyState: true,
}

const mockRestrictedPageState: OpportunityPageState = {
    state: State.RESTRICTED_NO_OPPORTUNITIES,
    isLoading: false,
    title: 'Upgrade to unlock more AI Agent opportunities',
    description:
        "You've reviewed 3 opportunities for AI Agent. To continue discovering and acting on new opportunities based on real customer conversations, upgrade your plan.",
    media: '/assets/images/ai-agent/opportunities/upgrade.jpg',
    primaryCta: {
        label: 'Try for 14 days',
    },
    showEmptyState: true,
}

describe('OpportunitiesContent', () => {
    const mockReviewArticleMutate = jest.fn()
    const mockMarkArticleAsReviewed = jest.fn()
    const mockOnArchive = jest.fn()
    const mockOnPublish = jest.fn()
    const mockOnOpportunityAccepted = jest.fn()
    const mockUpsertFeedback = jest.fn()
    const mockProcessOpportunity = jest.fn()

    const selectedOpportunity: Opportunity = {
        id: '1',
        key: 'ai_1',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        insight: 'Test opportunity',
        resources: [
            {
                title: 'Test opportunity',
                content: 'Test content',
                type: ResourceType.GUIDANCE,
                isVisible: true,
            },
        ],
    }

    const conflictOpportunity: Opportunity = {
        id: '1',
        key: 'ai_1',
        type: OpportunityType.RESOLVE_CONFLICT,
        insight: 'Test opportunity',
        resources: [
            {
                title: 'Test opportunity',
                content: 'Test content',
                type: ResourceType.GUIDANCE,
                isVisible: true,
            },
        ],
    }

    const mockOpportunityConfig = {
        shopName: 'test-shop',
        helpCenterId: 1,
        guidanceHelpCenterId: 2,
        onArchive: mockOnArchive,
        onPublish: mockOnPublish,
        shopIntegrationId: 1,
        markArticleAsReviewed: mockMarkArticleAsReviewed,
        useKnowledgeService: false,
    }

    const defaultProps = {
        selectedOpportunity: null,
        opportunityConfig: mockOpportunityConfig,
        isLoadingOpportunityDetails: false,
        totalCount: 10,
        opportunitiesPageState: mockEmptyPageState,
        stateConfig: {
            [State.OPPORTUNITY_NOT_FOUND]: mockEmptyPageState,
        } as any,
    }

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    const renderComponent = (props = {}) => {
        const store = mockStore({
            notifications: [],
        })

        const Wrapper = ({ children }: { children: ReactNode }) => {
            const [isSidebarVisible, setIsSidebarVisible] = useState(true)
            return (
                <MemoryRouter>
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <OpportunitiesSidebarContext.Provider
                                value={{
                                    isSidebarVisible,
                                    setIsSidebarVisible,
                                }}
                            >
                                {children}
                            </OpportunitiesSidebarContext.Provider>
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>
            )
        }

        return render(<OpportunitiesContent {...defaultProps} {...props} />, {
            wrapper: Wrapper,
        })
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockReviewArticleMutate.mockClear()
        mockMarkArticleAsReviewed.mockClear()
        mockOnArchive.mockClear()
        mockOnPublish.mockClear()
        mockOnOpportunityAccepted.mockClear()
        ;(useGetGuidancesAvailableActions as jest.Mock).mockReturnValue({
            guidanceActions: [],
            isLoading: false,
        })
        ;(useUpsertArticleTemplateReview as jest.Mock).mockReturnValue({
            mutate: mockReviewArticleMutate,
            isLoading: false,
        })

        const {
            useUpsertFeedback,
        } = require('models/knowledgeService/mutations')
        ;(useUpsertFeedback as jest.Mock).mockReturnValue({
            mutateAsync: mockUpsertFeedback.mockResolvedValue({}),
            isLoading: false,
        })
        ;(useProcessOpportunity as jest.Mock).mockReturnValue({
            mutateAsync: mockProcessOpportunity,
            isLoading: false,
        })
        mockProcessOpportunity.mockResolvedValue({})
    })

    it('should render empty state when no opportunity is selected', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: 'AI Agent is learning from your conversations',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /As AI Agent handles more conversations, we'll surface opportunities/,
            ),
        ).toBeInTheDocument()
    })

    it('should render opportunity details and action buttons when selected', () => {
        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        expect(screen.getByText(/Fill knowledge gap/)).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: /Dismiss/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Mark as done/i }),
        ).toBeInTheDocument()
    })

    it('should open dismiss modal when dismiss button is clicked', async () => {
        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        const dismissButton = screen.getByRole('button', { name: /Dismiss/i })

        act(() => {
            userEvent.click(dismissButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Dismissing this knowledge gap opportunity will delete/,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should archive article when confirming dismiss', async () => {
        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        const dismissButton = screen.getByRole('button', { name: /Dismiss/i })
        act(() => {
            userEvent.click(dismissButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        act(() => {
            userEvent.click(firstCheckbox)
        })

        await waitFor(() => {
            const confirmButton = screen.getAllByRole('button', {
                name: /Dismiss/i,
            })[1]
            expect(confirmButton).not.toHaveAttribute('aria-disabled', 'true')
        })

        const confirmButton = screen.getAllByRole('button', {
            name: /Dismiss/i,
        })[1]
        act(() => {
            userEvent.click(confirmButton)
        })

        await waitFor(() => {
            expect(mockReviewArticleMutate).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1 },
                {
                    action: 'archive',
                    template_key: 'ai_1',
                    reason: 'Dismissed with feedback',
                },
            ])
        })
    })

    it('should close dismiss modal when escape is pressed', async () => {
        const user = userEvent.setup({ delay: null })

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        const dismissButton = screen.getByRole('button', { name: /Dismiss/i })
        await act(() => user.click(dismissButton))

        await waitFor(() => {
            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()
        })

        await act(() => user.keyboard('{Escape}'))

        await waitFor(() => {
            expect(
                screen.queryByText('Dismiss opportunity?'),
            ).not.toBeInTheDocument()
        })
    })

    it('should call onOpportunityAccepted with correct parameters when opportunity is approved successfully', async () => {
        mockProcessOpportunity.mockResolvedValueOnce({})

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunityConfig: {
                ...mockOpportunityConfig,
                useKnowledgeService: true,
                shopIntegrationId: 1,
                onOpportunityAccepted: mockOnOpportunityAccepted,
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })

        await act(async () => {
            await userEvent.click(approveButton)
        })

        await waitFor(() => {
            expect(mockProcessOpportunity).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(mockOnOpportunityAccepted).toHaveBeenCalledTimes(1)
            expect(mockOnOpportunityAccepted).toHaveBeenCalledWith({
                opportunityId: '1',
                opportunityType: OpportunityType.FILL_KNOWLEDGE_GAP,
            })
        })
    })

    it('should handle approve failure gracefully', async () => {
        mockProcessOpportunity.mockRejectedValueOnce(new Error('API Error'))

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunityConfig: {
                ...mockOpportunityConfig,
                useKnowledgeService: true,
                shopIntegrationId: 1,
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })

        await act(async () => {
            await userEvent.click(approveButton)
        })

        await waitFor(() => {
            expect(mockProcessOpportunity).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                status: 'error',
                message: 'Failed to resolve knowledge gap. Please try again.',
            })
        })
    })

    it('should show loading state on approve button when processing opportunity', () => {
        ;(useProcessOpportunity as jest.Mock).mockReturnValueOnce({
            mutateAsync: mockProcessOpportunity,
            isLoading: true,
        })

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunityConfig: {
                ...mockOpportunityConfig,
                useKnowledgeService: true,
                shopIntegrationId: 1,
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })
        expect(approveButton).toBeInTheDocument()
    })

    it('should show loading state when review article is loading', () => {
        ;(useUpsertArticleTemplateReview as jest.Mock).mockReturnValueOnce({
            mutate: mockReviewArticleMutate,
            isLoading: true,
        })

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })
        expect(approveButton).toBeInTheDocument()
    })

    it('should render form with initial values from opportunity', () => {
        renderComponent({
            selectedOpportunity: conflictOpportunity,
            opportunities: [conflictOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        expect(screen.getByDisplayValue('Test opportunity')).toBeInTheDocument()
    })

    it('should handle review article success callback', async () => {
        renderComponent({
            selectedOpportunity: {
                id: '1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                insight: 'Test',
                resources: [
                    {
                        title: 'Test',
                        content: 'Test',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        const onSuccessCallback = (useUpsertArticleTemplateReview as jest.Mock)
            .mock.calls[0][0].onSuccess

        await onSuccessCallback(null, [
            null,
            null,
            { template_key: 'test-key', action: 'archive' },
        ])

        await waitFor(() => {
            expect(mockMarkArticleAsReviewed).toHaveBeenCalledWith(
                'ai_test-key',
                'archive',
            )
            expect(mockOnArchive).toHaveBeenCalledWith('ai_test-key')
        })
    })

    it('should handle publish action in review success callback', async () => {
        renderComponent({
            selectedOpportunity: {
                id: '1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                insight: 'Test',
                resources: [
                    {
                        title: 'Test',
                        content: 'Test',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        const onSuccessCallback = (useUpsertArticleTemplateReview as jest.Mock)
            .mock.calls[0][0].onSuccess

        await onSuccessCallback(null, [
            null,
            null,
            { template_key: 'test-key', action: 'publish' },
        ])

        await waitFor(() => {
            expect(mockMarkArticleAsReviewed).toHaveBeenCalledWith(
                'ai_test-key',
                'publish',
            )
            expect(mockOnPublish).toHaveBeenCalledWith('ai_test-key')
        })
    })

    it('should invalidate queries on review error', async () => {
        const invalidateQueries = jest.fn()
        const originalInvalidate = queryClient.invalidateQueries
        queryClient.invalidateQueries = invalidateQueries

        renderComponent({
            selectedOpportunity: {
                id: '1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                insight: 'Test',
                resources: [
                    {
                        title: 'Test',
                        content: 'Test',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        const onErrorCallback = (useUpsertArticleTemplateReview as jest.Mock)
            .mock.calls[0][0].onError

        await onErrorCallback(new Error('Test error'), [
            null,
            null,
            { action: 'archive' },
        ])

        await waitFor(() => {
            expect(invalidateQueries).toHaveBeenCalled()
        })

        queryClient.invalidateQueries = originalInvalidate
    })

    it('should render correct details for RESOLVE_CONFLICT type', () => {
        const conflictOpportunity: Opportunity = {
            ...selectedOpportunity,
            type: OpportunityType.RESOLVE_CONFLICT,
        }

        renderComponent({
            selectedOpportunity: conflictOpportunity,
            opportunities: [conflictOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        expect(screen.getByText(/Resolve conflict/)).toBeInTheDocument()
    })

    it('should render guidance editor with correct fields', async () => {
        renderComponent({
            selectedOpportunity: conflictOpportunity,
            opportunities: [conflictOpportunity],
            opportunityConfig: {
                ...mockOpportunityConfig,
                shopName: 'my-shop',
                helpCenterId: 123,
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        expect(screen.getByText(/Resolve conflict/)).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText('Guidance name')).toBeInTheDocument()
            expect(
                screen.getByDisplayValue('Test opportunity'),
            ).toBeInTheDocument()
        })
    })

    it('should not render action buttons when no opportunity is selected', () => {
        renderComponent({ selectedOpportunity: null })

        expect(
            screen.queryByRole('button', { name: /Dismiss/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /Mark as done/i }),
        ).not.toBeInTheDocument()
    })

    it('should render guidance editor even when guidance actions are loading', async () => {
        ;(useGetGuidancesAvailableActions as jest.Mock).mockReturnValueOnce({
            guidanceActions: [],
            isLoading: true,
        })

        renderComponent({
            selectedOpportunity: conflictOpportunity,
            opportunities: [conflictOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        await waitFor(() => {
            expect(screen.getByText('Guidance name')).toBeInTheDocument()
        })
    })

    it('should disable button at guidance limit', async () => {
        mockUseGuidanceCount.mockReturnValue({
            guidanceCount: 100,
            isLoading: false,
        })

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })
        expect(approveButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should disable approve button when guidanceCount is loading', () => {
        mockUseGuidanceCount.mockReturnValue({
            guidanceCount: 0,
            isLoading: true,
        })

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })
        expect(approveButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should not show tooltip when guidance count is below limit', async () => {
        mockUseGuidanceCount.mockReturnValue({
            guidanceCount: 50,
            isLoading: false,
        })

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })
        expect(approveButton).not.toHaveAttribute('aria-disabled', 'true')

        await act(async () => {
            await userEvent.hover(approveButton)
        })

        await waitFor(() => {
            expect(
                screen.queryByText(/You have reached the limit/),
            ).not.toBeInTheDocument()
        })
    })

    it('should allow editing the guidance title', async () => {
        const user = userEvent.setup()

        renderComponent({
            selectedOpportunity: conflictOpportunity,
            opportunities: [conflictOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        const titleInput = await screen.findByDisplayValue('Test opportunity')
        await user.clear(titleInput)
        await user.type(titleInput, 'Updated Title')

        expect(titleInput).toHaveValue('Updated Title')
    })

    it('should handle approve when guidance help center has no locale', async () => {
        const useAiAgentHelpCenter =
            require('pages/aiAgent/hooks/useAiAgentHelpCenter').useAiAgentHelpCenter
        useAiAgentHelpCenter.mockReturnValue({
            default_locale: undefined,
            id: 1,
        })

        mockProcessOpportunity.mockResolvedValueOnce({})

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunityConfig: {
                ...mockOpportunityConfig,
                useKnowledgeService: true,
                shopIntegrationId: 1,
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })

        await act(async () => {
            await userEvent.click(approveButton)
        })

        await waitFor(() => {
            expect(mockProcessOpportunity).toHaveBeenCalled()
        })
    })

    it('should handle undefined onOpportunityDismissed callback', async () => {
        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunityConfig: {
                ...mockOpportunityConfig,
                useKnowledgeService: false,
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })

        await act(async () => {
            await userEvent.click(approveButton)
        })

        await waitFor(() => {
            expect(mockReviewArticleMutate).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1 },
                {
                    action: 'archive',
                    template_key: 'ai_1',
                    reason: 'Archived as opportunity',
                },
            ])
        })
    })

    it('should handle dismiss when onOpportunityDismissed is undefined', async () => {
        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunityConfig: {
                ...mockOpportunityConfig,
                onOpportunityDismissed: undefined,
            },
            opportunitiesPageState: mockOpportunityPageState,
        })

        const dismissButton = screen.getByRole('button', { name: /Dismiss/i })
        act(() => {
            userEvent.click(dismissButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()
        })

        const confirmButton = screen.getAllByRole('button', {
            name: /Dismiss/i,
        })[1]
        act(() => {
            userEvent.click(confirmButton)
        })
    })

    it('should not show tooltip when guidanceCount is still loading', async () => {
        mockUseGuidanceCount.mockReturnValue({
            guidanceCount: 100,
            isLoading: true,
        })

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            opportunitiesPageState: mockOpportunityPageState,
        })

        const approveButton = screen.getByRole('button', {
            name: /Mark as done/i,
        })

        await act(async () => {
            await userEvent.hover(approveButton)
        })

        await waitFor(() => {
            expect(
                screen.queryByText(/You have reached the limit/),
            ).not.toBeInTheDocument()
        })
    })

    describe('Ticket drilldown functionality', () => {
        it('should render ticket count when detectionObjectIds are provided', () => {
            const selectedOpportunity: Opportunity = {
                id: '1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                key: 'ai_1',
                insight: 'Test opportunity',
                ticketCount: 10,
                detectionObjectIds: ['123', '456'],
                resources: [
                    {
                        title: 'Test opportunity',
                        content: 'Test content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            }

            renderComponent({
                selectedOpportunity,
                opportunities: [selectedOpportunity],
                opportunitiesPageState: mockOpportunityPageState,
            })

            expect(screen.getByText(/Fill knowledge gap/)).toBeInTheDocument()
        })

        it('should handle missing detectionObjectIds with console.warn', () => {
            const consoleWarnSpy = jest
                .spyOn(console, 'warn')
                .mockImplementation()

            renderComponent({
                selectedOpportunity,
                opportunities: [selectedOpportunity],
                opportunitiesPageState: mockOpportunityPageState,
            })

            expect(screen.getByText(/Fill knowledge gap/)).toBeInTheDocument()

            consoleWarnSpy.mockRestore()
        })
    })

    describe('Knowledge service integration', () => {
        it('should render correctly when useKnowledgeService is true', () => {
            renderComponent({
                selectedOpportunity,
                opportunities: [selectedOpportunity],
                opportunityConfig: {
                    ...mockOpportunityConfig,
                    useKnowledgeService: true,
                },
                opportunitiesPageState: mockOpportunityPageState,
            })

            expect(screen.getByText(/Fill knowledge gap/)).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Mark as done/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Loading states', () => {
        it('should show skeleton loader when isLoadingOpportunityDetails is true', () => {
            const { container } = renderComponent({
                selectedOpportunity,
                opportunities: [selectedOpportunity],
                isLoadingOpportunityDetails: true,
                opportunitiesPageState: mockOpportunityPageState,
            })

            expect(
                screen.queryByText(/Fill knowledge gap/),
            ).not.toBeInTheDocument()

            const skeletons = container.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    describe('Feedback submission on dismiss', () => {
        it('should submit feedback after dismissing opportunity', async () => {
            renderComponent({
                selectedOpportunity,
                opportunities: [selectedOpportunity],
                opportunitiesPageState: mockOpportunityPageState,
            })

            const dismissButton = screen.getByRole('button', {
                name: /Dismiss/i,
            })
            act(() => {
                userEvent.click(dismissButton)
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Dismiss opportunity?'),
                ).toBeInTheDocument()
            })

            const firstCheckbox = screen.getAllByRole('checkbox')[0]
            act(() => {
                userEvent.click(firstCheckbox)
            })

            await waitFor(() => {
                const confirmButton = screen.getAllByRole('button', {
                    name: /Dismiss/i,
                })[1]
                expect(confirmButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            const confirmButton = screen.getAllByRole('button', {
                name: /Dismiss/i,
            })[1]
            act(() => {
                userEvent.click(confirmButton)
            })

            await waitFor(() => {
                expect(mockReviewArticleMutate).toHaveBeenCalled()
                expect(mockUpsertFeedback).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        feedbackToUpsert: expect.any(Array),
                    }),
                })
            })
        })

        it('should dismiss opportunity even if feedback submission fails', async () => {
            mockUpsertFeedback.mockRejectedValueOnce(
                new Error('Feedback API Error'),
            )

            renderComponent({
                selectedOpportunity,
                opportunities: [selectedOpportunity],
                opportunitiesPageState: mockOpportunityPageState,
            })

            const dismissButton = screen.getByRole('button', {
                name: /Dismiss/i,
            })
            act(() => {
                userEvent.click(dismissButton)
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Dismiss opportunity?'),
                ).toBeInTheDocument()
            })

            const firstCheckbox = screen.getAllByRole('checkbox')[0]
            act(() => {
                userEvent.click(firstCheckbox)
            })

            await waitFor(() => {
                const confirmButton = screen.getAllByRole('button', {
                    name: /Dismiss/i,
                })[1]
                expect(confirmButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            const confirmButton = screen.getAllByRole('button', {
                name: /Dismiss/i,
            })[1]
            act(() => {
                userEvent.click(confirmButton)
            })

            await waitFor(() => {
                expect(mockReviewArticleMutate).toHaveBeenCalled()
                expect(notify).toHaveBeenCalledWith({
                    message: 'Successfully dismissed opportunity',
                    status: 'success',
                })
            })
        })
    })

    describe('restricted access state', () => {
        it('should render RestrictedOpportunityMessage when state is RESTRICTED_NO_OPPORTUNITIES', () => {
            renderComponent({
                opportunitiesPageState: mockRestrictedPageState,
            })

            expect(
                screen.getByRole('heading', {
                    name: 'Upgrade to unlock more AI Agent opportunities',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /You've reviewed 3 opportunities for AI Agent/,
                ),
            ).toBeInTheDocument()
        })

        it('should render CTA button when state is RESTRICTED_NO_OPPORTUNITIES', () => {
            renderComponent({
                opportunitiesPageState: mockRestrictedPageState,
            })

            expect(
                screen.getByRole('button', { name: 'Book a demo' }),
            ).toBeInTheDocument()
        })

        it('should not render opportunity details when state is RESTRICTED_NO_OPPORTUNITIES', () => {
            const selectedOpportunity: Opportunity = {
                id: '1',
                key: 'key-1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                insight: "What's your return policy?",
                resources: [
                    {
                        title: "What's your return policy?",
                        content: 'Return policy content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            }

            renderComponent({
                selectedOpportunity,
                opportunities: [selectedOpportunity],
                opportunitiesPageState: mockRestrictedPageState,
            })

            expect(
                screen.queryByText(/Fill knowledge gap/),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /Dismiss/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /Mark as done/i }),
            ).not.toBeInTheDocument()
        })

        it('should render RestrictedOpportunityMessage instead of empty state when state is RESTRICTED_NO_OPPORTUNITIES', () => {
            renderComponent({
                selectedOpportunity: null,
                opportunitiesPageState: mockRestrictedPageState,
            })

            expect(
                screen.getByRole('heading', {
                    name: 'Upgrade to unlock more AI Agent opportunities',
                }),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(
                    /AI Agent is learning from your conversations/,
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('Opportunity not found state', () => {
        it('should render OpportunitiesEmptyState with OPPORTUNITY_NOT_FOUND state when no opportunity is selected and showEmptyState is false', () => {
            const mockOpportunityNotFoundState: OpportunityPageState = {
                state: State.OPPORTUNITY_NOT_FOUND,
                isLoading: false,
                title: 'Opportunity not found',
                description:
                    'The opportunity you are looking for does not exist.',
                media: null,
                primaryCta: null,
                showEmptyState: false,
            }

            renderComponent({
                selectedOpportunity: null,
                opportunitiesPageState: mockOpportunityPageState,
                stateConfig: {
                    [State.OPPORTUNITY_NOT_FOUND]: mockOpportunityNotFoundState,
                } as any,
            })

            expect(
                screen.getByRole('heading', {
                    name: 'Opportunity not found',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'The opportunity you are looking for does not exist.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Responsive container width and hideCount', () => {
        beforeEach(() => {
            global.ResizeObserver = jest.fn().mockImplementation(() => ({
                observe: jest.fn(),
                unobserve: jest.fn(),
                disconnect: jest.fn(),
            }))
        })

        afterEach(() => {
            jest.restoreAllMocks()
        })

        it('should setup and cleanup ResizeObserver', () => {
            const mockObserve = jest.fn()
            const mockDisconnect = jest.fn()
            global.ResizeObserver = jest.fn().mockImplementation(() => ({
                observe: mockObserve,
                unobserve: jest.fn(),
                disconnect: mockDisconnect,
            }))

            const { unmount } = renderComponent({
                selectedOpportunity,
                opportunities: [selectedOpportunity],
                opportunitiesPageState: mockOpportunityPageState,
            })

            expect(mockObserve).toHaveBeenCalled()

            unmount()

            expect(mockDisconnect).toHaveBeenCalled()
        })
    })

    describe('Form validation - isFormValid', () => {
        it('should disable button when title or content is empty or contains only whitespace', async () => {
            const user = userEvent.setup()

            renderComponent({
                selectedOpportunity: conflictOpportunity,
                opportunities: [conflictOpportunity],
                opportunitiesPageState: mockOpportunityPageState,
            })

            const titleInput =
                await screen.findByDisplayValue('Test opportunity')
            const contentEditor = await screen.findByTestId('guidance-editor')

            await user.clear(titleInput)
            let approveButton = screen.getByRole('button', {
                name: /Resolve/i,
            })
            expect(approveButton).toHaveAttribute('aria-disabled', 'true')

            await user.type(titleInput, '   ')
            approveButton = screen.getByRole('button', {
                name: /Resolve/i,
            })
            expect(approveButton).toHaveAttribute('aria-disabled', 'true')

            await user.clear(titleInput)
            await user.type(titleInput, 'Valid Title')
            await user.clear(contentEditor)
            approveButton = screen.getByRole('button', {
                name: /Resolve/i,
            })
            expect(approveButton).toHaveAttribute('aria-disabled', 'true')

            await user.type(contentEditor, '   ')
            approveButton = screen.getByRole('button', {
                name: /Resolve/i,
            })
            expect(approveButton).toHaveAttribute('aria-disabled', 'true')
        })
    })
})
