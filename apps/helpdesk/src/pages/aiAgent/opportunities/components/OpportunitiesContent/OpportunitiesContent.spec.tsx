// oxlint-disable exhaustive-deps
import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { useUpsertArticleTemplateReview } from 'pages/settings/helpCenter/queries'
import { notify } from 'state/notifications/actions'

import { OpportunityType } from '../../enums'
import { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
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

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation')
jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)
jest.mock('pages/settings/helpCenter/queries')
jest.mock('models/knowledgeService/mutations')

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

const mockOnValuesChange = jest.fn()
const mockGuidanceForm = jest.fn()

jest.mock('../../../components/GuidanceForm/GuidanceForm', () => ({
    GuidanceForm: (props: any) => {
        mockGuidanceForm(props)
        React.useEffect(() => {
            if (props.onValuesChange && props.initialFields) {
                mockOnValuesChange(props.initialFields)
                props.onValuesChange(props.initialFields)
            }
        }, [])
        return <div data-testid="guidance-form">Guidance Form</div>
    },
}))

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('OpportunitiesContent', () => {
    const mockCreateGuidanceArticle = jest.fn()
    const mockReviewArticleMutate = jest.fn()
    const mockMarkArticleAsReviewed = jest.fn()
    const mockOnArchive = jest.fn()
    const mockOnPublish = jest.fn()
    const mockUpsertFeedback = jest.fn()

    const defaultProps = {
        selectedOpportunity: null,
        shopName: 'test-shop',
        helpCenterId: 1,
        guidanceHelpCenterId: 2,
        onArchive: mockOnArchive,
        onPublish: mockOnPublish,
        markArticleAsReviewed: mockMarkArticleAsReviewed,
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

        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <OpportunitiesContent {...defaultProps} {...props} />
                </QueryClientProvider>
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockCreateGuidanceArticle.mockClear()
        mockOnValuesChange.mockClear()
        mockGuidanceForm.mockClear()
        mockReviewArticleMutate.mockClear()
        mockMarkArticleAsReviewed.mockClear()
        mockOnArchive.mockClear()
        mockOnPublish.mockClear()
        ;(useGuidanceArticleMutation as jest.Mock).mockReturnValue({
            createGuidanceArticle: mockCreateGuidanceArticle,
            isGuidanceArticleUpdating: false,
        })
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
    })

    it('should render content header with title', () => {
        const { container } = renderComponent()

        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('should render empty state when no opportunity is selected', () => {
        const { container } = renderComponent()

        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('should render opportunity details and action buttons when selected', () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            key: 'key-1',
            title: "What's your return policy?",
            content: 'Return policy content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
        expect(
            screen.getByText(/Review and approve this AI-generated Guidance/),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: /Dismiss/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Approve/i }),
        ).toBeInTheDocument()
    })

    it('should open dismiss modal when dismiss button is clicked', async () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const dismissButton = screen.getByRole('button', { name: /Dismiss/i })

        act(() => {
            userEvent.click(dismissButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Dismissing this opportunity will delete the associated/,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should archive article when confirming dismiss', async () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const dismissButton = screen.getByRole('button', { name: /Dismiss/i })
        act(() => {
            userEvent.click(dismissButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()
        })

        const dropdown = screen.getByRole('combobox')
        act(() => {
            userEvent.click(dropdown)
        })

        await waitFor(() => {
            expect(screen.getAllByRole('option')).toHaveLength(4)
        })

        const firstOption = screen.getAllByRole('option')[0]
        act(() => {
            userEvent.click(firstOption)
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

    it('should close dismiss modal when cancel button is clicked', async () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const dismissButton = screen.getByRole('button', { name: /Dismiss/i })
        act(() => {
            userEvent.click(dismissButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()
        })

        const cancelButton = screen.getByRole('button', { name: /Cancel/i })
        act(() => {
            userEvent.click(cancelButton)
        })

        await waitFor(() => {
            expect(
                screen.queryByText('Dismiss opportunity?'),
            ).not.toBeInTheDocument()
        })
    })

    it('should create guidance and archive article when approving', async () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        mockCreateGuidanceArticle.mockResolvedValueOnce({})

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const approveButton = screen.getByRole('button', { name: /Approve/i })

        await act(async () => {
            await userEvent.click(approveButton)
        })

        await waitFor(() => {
            expect(mockCreateGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Test opportunity',
                    content: 'Test content',
                    is_visible: true,
                    locale: 'en-US',
                    ai_suggestion_key: '1',
                }),
            )
        })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                status: 'success',
                message: 'Guidance successfully created',
            })
        })

        await waitFor(() => {
            expect(mockReviewArticleMutate).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1 },
                {
                    action: 'archive',
                    template_key: 'ai_1',
                    reason: 'Created as guidance',
                },
            ])
        })
    })

    it('should handle approve failure gracefully', async () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        mockCreateGuidanceArticle.mockRejectedValueOnce(new Error('API Error'))

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const approveButton = screen.getByRole('button', { name: /Approve/i })

        await act(async () => {
            await userEvent.click(approveButton)
        })

        await waitFor(() => {
            expect(mockCreateGuidanceArticle).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                status: 'error',
                message: 'Failed to create guidance. Please try again.',
            })
        })

        expect(mockReviewArticleMutate).not.toHaveBeenCalled()
    })

    it('should show loading state on approve button when creating guidance', () => {
        ;(useGuidanceArticleMutation as jest.Mock).mockReturnValueOnce({
            createGuidanceArticle: mockCreateGuidanceArticle,
            isGuidanceArticleUpdating: true,
        })

        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const approveButton = screen.getByRole('button', { name: /Approve/i })
        expect(approveButton).toBeInTheDocument()
    })

    it('should show loading state when review article is loading', () => {
        ;(useUpsertArticleTemplateReview as jest.Mock).mockReturnValueOnce({
            mutate: mockReviewArticleMutate,
            isLoading: true,
        })

        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const approveButton = screen.getByRole('button', { name: /Approve/i })
        expect(approveButton).toBeInTheDocument()
    })

    it('should update form data when values change', () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        expect(mockOnValuesChange).toHaveBeenCalledWith({
            name: 'Test opportunity',
            content: 'Test content',
            isVisible: true,
        })
    })

    it('should handle review article success callback', async () => {
        renderComponent({
            selectedOpportunity: {
                id: '1',
                title: 'Test',
                content: 'Test',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            },
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
                title: 'Test',
                content: 'Test',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            },
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
                title: 'Test',
                content: 'Test',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            },
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
        const selectedOpportunity: Opportunity = {
            id: '2',
            title: 'Topic',
            content: 'Conflict content',
            type: OpportunityType.RESOLVE_CONFLICT,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        expect(screen.getByText('Resolve conflict')).toBeInTheDocument()
        expect(
            screen.getByText(/Review and approve this AI-generated Guidance/),
        ).toBeInTheDocument()
    })

    it('should pass correct props to GuidanceForm', () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            shopName: 'my-shop',
            helpCenterId: 123,
        })

        expect(screen.getByTestId('guidance-form')).toBeInTheDocument()
    })

    it('should not render action buttons when no opportunity is selected', () => {
        renderComponent({ selectedOpportunity: null })

        expect(
            screen.queryByRole('button', { name: /Dismiss/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /Approve/i }),
        ).not.toBeInTheDocument()
    })

    it('should handle loading state from guidance actions', () => {
        ;(useGetGuidancesAvailableActions as jest.Mock).mockReturnValueOnce({
            guidanceActions: [],
            isLoading: true,
        })

        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        expect(screen.getByTestId('guidance-form')).toBeInTheDocument()
    })

    it('should show tooltip when hovering disabled button at guidance limit', async () => {
        mockUseGuidanceCount.mockReturnValue({
            guidanceCount: 100,
            isLoading: false,
        })

        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const approveButton = screen.getByRole('button', { name: /Approve/i })
        expect(approveButton).toHaveAttribute('aria-disabled', 'true')

        await act(async () => {
            await userEvent.hover(approveButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText(/You have reached the limit/),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: /Guidance/i }),
            ).toHaveAttribute('href', '/ai-agent/guidance')
        })
    })

    it('should disable approve button when guidanceCount is loading', () => {
        mockUseGuidanceCount.mockReturnValue({
            guidanceCount: 0,
            isLoading: true,
        })

        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const approveButton = screen.getByRole('button', { name: /Approve/i })
        expect(approveButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should not show tooltip when guidance count is below limit', async () => {
        mockUseGuidanceCount.mockReturnValue({
            guidanceCount: 50,
            isLoading: false,
        })

        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const approveButton = screen.getByRole('button', { name: /Approve/i })
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

    it('should handle form value changes', () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const formProps = mockGuidanceForm.mock.calls[0][0]
        const newFormData = {
            name: 'Updated Title',
            content: 'Updated Content',
            isVisible: false,
        }

        act(() => {
            formProps.onValuesChange(newFormData)
        })

        expect(mockOnValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test opportunity',
                content: 'Test content',
                isVisible: true,
            }),
        )
    })

    it('should handle approve when guidance help center has no locale', async () => {
        const useAiAgentHelpCenter =
            require('pages/aiAgent/hooks/useAiAgentHelpCenter').useAiAgentHelpCenter
        useAiAgentHelpCenter.mockReturnValue({
            default_locale: undefined,
            id: 1,
        })
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        mockCreateGuidanceArticle.mockResolvedValueOnce({})

        const store = mockStore({
            notifications: [],
        })

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <OpportunitiesContent
                        {...defaultProps}
                        selectedOpportunity={selectedOpportunity}
                        opportunities={[selectedOpportunity]}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        const approveButton = screen.getByRole('button', { name: /Approve/i })

        await act(async () => {
            await userEvent.click(approveButton)
        })

        await waitFor(() => {
            expect(mockCreateGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    locale: 'en-US',
                }),
            )
        })
    })

    it('should handle undefined onOpportunityDismissed callback', async () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        mockCreateGuidanceArticle.mockResolvedValueOnce({})

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const approveButton = screen.getByRole('button', { name: /Approve/i })

        await act(async () => {
            await userEvent.click(approveButton)
        })

        await waitFor(() => {
            expect(mockCreateGuidanceArticle).toHaveBeenCalled()
            expect(mockReviewArticleMutate).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1 },
                {
                    action: 'archive',
                    template_key: 'ai_1',
                    reason: 'Created as guidance',
                },
            ])
        })
    })

    it('should handle dismiss when onOpportunityDismissed is undefined', async () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
            onOpportunityDismissed: undefined,
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

        const selectedOpportunity: Opportunity = {
            id: '1',
            title: 'Test opportunity',
            content: 'Test content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            key: 'ai_1',
        }

        renderComponent({
            selectedOpportunity,
            opportunities: [selectedOpportunity],
        })

        const approveButton = screen.getByRole('button', { name: /Approve/i })

        await act(async () => {
            await userEvent.hover(approveButton)
        })

        await waitFor(() => {
            expect(
                screen.queryByText(/You have reached the limit/),
            ).not.toBeInTheDocument()
        })
    })
})
