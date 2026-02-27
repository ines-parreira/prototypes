import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
import { ResourceType } from '../../types'
import { OpportunityDetailsContent } from './OpportunityDetailsContent'

jest.mock('../OpportunityDetailsCard/OpportunityDetailsCard', () => ({
    OpportunityDetailsCard: ({
        type,
        ticketCount,
        onTicketCountClick,
    }: any) => (
        <div data-testid="opportunity-details-card">
            <div>Type: {type}</div>
            <div>Ticket Count: {ticketCount}</div>
            <button onClick={onTicketCountClick}>View Tickets</button>
        </div>
    ),
}))

jest.mock('../OpportunityGuidanceEditor/OpportunityGuidanceEditor', () => ({
    OpportunityGuidanceEditor: ({
        resource,
        shopName,
        onValuesChange,
        isInReadOnlyMode,
    }: any) => (
        <div data-testid="opportunity-guidance-editor">
            <div>Resource: {resource.title}</div>
            <div>Shop: {shopName}</div>
            <div>Editor Mode: {String(isInReadOnlyMode)}</div>
            <input
                placeholder="Title"
                onChange={(e) =>
                    onValuesChange({
                        title: e.target.value,
                        body: resource.content,
                        isVisible: true,
                    })
                }
            />
        </div>
    ),
}))

jest.mock('../OpportunityArticleEditor/OpportunityArticleEditor', () => ({
    OpportunityArticleEditor: ({ resource, onValuesChange }: any) => (
        <div data-testid="opportunity-article-editor">
            <div>Article: {resource.title}</div>
            <input
                placeholder="Article Title"
                onChange={(e) =>
                    onValuesChange({
                        title: e.target.value,
                        content: resource.content,
                        isVisible: resource.isVisible,
                    })
                }
            />
        </div>
    ),
}))

jest.mock('../OpportunitySnippetEditor/OpportunitySnippetEditor', () => ({
    OpportunitySnippetEditor: ({ resource, shopName, onValuesChange }: any) => (
        <div data-testid="opportunity-snippet-editor">
            <div>Snippet: {resource.title}</div>
            <div>Shop: {shopName}</div>
            <input
                placeholder="Snippet Title"
                onChange={(e) =>
                    onValuesChange({
                        title: e.target.value,
                        content: resource.content,
                        isVisible: resource.isVisible,
                    })
                }
            />
        </div>
    ),
}))

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

const mockOpportunityConfig = {
    shopName: 'test-shop',
    shopIntegrationId: 456,
    helpCenterId: 789,
    guidanceHelpCenterId: 101,
    useKnowledgeService: true,
    onArchive: jest.fn(),
    onPublish: jest.fn(),
    markArticleAsReviewed: jest.fn(),
}

describe('OpportunityDetailsContent', () => {
    const defaultProps = {
        selectedOpportunity: mockOpportunity,
        opportunityConfig: mockOpportunityConfig,
        onTicketCountClick: jest.fn(),
        onFormValuesChange: jest.fn(),
        onOpportunityRemoved: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props = {}) => {
        return render(
            <OpportunityDetailsContent {...defaultProps} {...props} />,
        )
    }

    describe('Knowledge Gap Opportunities', () => {
        it('should render content for knowledge gap opportunities', () => {
            renderComponent()

            expect(
                screen.getByTestId('opportunity-details-card'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('opportunity-guidance-editor'),
            ).toBeInTheDocument()
        })

        it('should render OpportunityDetailsCard with correct props', () => {
            renderComponent()

            expect(
                screen.getByText(`Type: ${OpportunityType.FILL_KNOWLEDGE_GAP}`),
            ).toBeInTheDocument()
            expect(screen.getByText('Ticket Count: 5')).toBeInTheDocument()
        })

        it('should render OpportunityGuidanceEditor with correct props', () => {
            renderComponent()

            expect(
                screen.getByText('Resource: Test Opportunity'),
            ).toBeInTheDocument()
            expect(screen.getByText('Shop: test-shop')).toBeInTheDocument()
            expect(screen.getByText('Editor Mode: true')).toBeInTheDocument()
        })

        it('should call onTicketCountClick when ticket count is clicked', async () => {
            const user = userEvent.setup()
            const onTicketCountClick = jest.fn()

            renderComponent({ onTicketCountClick })

            const viewTicketsButton = screen.getByRole('button', {
                name: /view tickets/i,
            })
            await user.click(viewTicketsButton)

            expect(onTicketCountClick).toHaveBeenCalledTimes(1)
        })

        it('should call onFormValuesChange when form values change', async () => {
            const user = userEvent.setup()
            const onFormValuesChange = jest.fn()

            renderComponent({ onFormValuesChange })

            const titleInput = screen.getByPlaceholderText('Title')
            await user.type(titleInput, 'New')

            expect(onFormValuesChange).toHaveBeenCalled()
            expect(onFormValuesChange).toHaveBeenCalledWith(0, {
                title: 'New',
                body: 'Test content',
                isVisible: true,
            })
        })
    })

    describe('Resolve Conflict Opportunities', () => {
        it('should render content for conflict opportunities', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
            })

            expect(
                screen.getByTestId('opportunity-details-card'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Type: RESOLVE_CONFLICT'),
            ).toBeInTheDocument()
        })

        it('should render OpportunityGuidanceEditor with isInReadOnlyMode=false for conflicts', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
            })

            expect(
                screen.getByTestId('opportunity-guidance-editor'),
            ).toBeInTheDocument()
            expect(screen.getByText('Editor Mode: false')).toBeInTheDocument()
        })
    })

    describe('Article Resources', () => {
        it('should render OpportunityArticleEditor for article resources', () => {
            const articleOpportunity: Opportunity = {
                ...mockOpportunity,
                resources: [
                    {
                        title: 'Test Article',
                        content: 'Article content',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                    },
                ],
            }

            renderComponent({
                selectedOpportunity: articleOpportunity,
            })

            expect(
                screen.getByTestId('opportunity-article-editor'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Article: Test Article'),
            ).toBeInTheDocument()
        })

        it('should call onFormValuesChange when article values change', async () => {
            const user = userEvent.setup()
            const onFormValuesChange = jest.fn()
            const articleOpportunity: Opportunity = {
                ...mockOpportunity,
                resources: [
                    {
                        title: 'Test Article',
                        content: 'Article content',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                    },
                ],
            }

            renderComponent({
                selectedOpportunity: articleOpportunity,
                onFormValuesChange,
            })

            const titleInput = screen.getByPlaceholderText('Article Title')
            await user.type(titleInput, 'Updated')

            expect(onFormValuesChange).toHaveBeenCalled()
            expect(onFormValuesChange).toHaveBeenCalledWith(0, {
                title: 'Updated',
                content: 'Article content',
                isVisible: true,
            })
        })
    })

    describe('External Snippet Resources', () => {
        it('should render OpportunitySnippetEditor for external snippet resources', () => {
            const snippetOpportunity: Opportunity = {
                ...mockOpportunity,
                resources: [
                    {
                        title: 'Test Snippet',
                        content: 'Snippet content',
                        type: ResourceType.EXTERNAL_SNIPPET,
                        isVisible: true,
                    },
                ],
            }

            renderComponent({
                selectedOpportunity: snippetOpportunity,
            })

            expect(
                screen.getByTestId('opportunity-snippet-editor'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Snippet: Test Snippet'),
            ).toBeInTheDocument()
            expect(screen.getByText('Shop: test-shop')).toBeInTheDocument()
        })

        it('should call onFormValuesChange when snippet values change', async () => {
            const user = userEvent.setup()
            const onFormValuesChange = jest.fn()
            const snippetOpportunity: Opportunity = {
                ...mockOpportunity,
                resources: [
                    {
                        title: 'Test Snippet',
                        content: 'Snippet content',
                        type: ResourceType.EXTERNAL_SNIPPET,
                        isVisible: false,
                    },
                ],
            }

            renderComponent({
                selectedOpportunity: snippetOpportunity,
                onFormValuesChange,
            })

            const titleInput = screen.getByPlaceholderText('Snippet Title')
            await user.type(titleInput, 'New')

            expect(onFormValuesChange).toHaveBeenCalled()
            expect(onFormValuesChange).toHaveBeenCalledWith(0, {
                title: 'New',
                content: 'Snippet content',
                isVisible: false,
            })
        })
    })

    describe('Multiple Resources', () => {
        it('should render multiple resources of different types', () => {
            const multiResourceOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
                resources: [
                    {
                        title: 'Guidance Resource',
                        content: 'Guidance content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                    {
                        title: 'Article Resource',
                        content: 'Article content',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                    },
                    {
                        title: 'Snippet Resource',
                        content: 'Snippet content',
                        type: ResourceType.EXTERNAL_SNIPPET,
                        isVisible: true,
                    },
                ],
            }

            renderComponent({
                selectedOpportunity: multiResourceOpportunity,
            })

            expect(
                screen.getByTestId('opportunity-guidance-editor'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('opportunity-article-editor'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('opportunity-snippet-editor'),
            ).toBeInTheDocument()
        })

        it('should call onFormValuesChange with correct index for each resource', async () => {
            const user = userEvent.setup()
            const onFormValuesChange = jest.fn()
            const multiResourceOpportunity: Opportunity = {
                ...mockOpportunity,
                resources: [
                    {
                        title: 'First Resource',
                        content: 'First content',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                    },
                    {
                        title: 'Second Resource',
                        content: 'Second content',
                        type: ResourceType.EXTERNAL_SNIPPET,
                        isVisible: true,
                    },
                ],
            }

            renderComponent({
                selectedOpportunity: multiResourceOpportunity,
                onFormValuesChange,
            })

            const articleInput = screen.getByPlaceholderText('Article Title')
            await user.type(articleInput, 'A')

            expect(onFormValuesChange).toHaveBeenCalledWith(
                0,
                expect.objectContaining({
                    title: 'A',
                }),
            )

            onFormValuesChange.mockClear()

            const snippetInput = screen.getByPlaceholderText('Snippet Title')
            await user.type(snippetInput, 'B')

            expect(onFormValuesChange).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    title: 'B',
                }),
            )
        })
    })

    describe('Unknown Resource Type', () => {
        it('should not render anything for unknown resource types', () => {
            const unknownResourceOpportunity: Opportunity = {
                ...mockOpportunity,
                resources: [
                    {
                        title: 'Unknown Resource',
                        content: 'Unknown content',
                        type: 'UNKNOWN_TYPE' as ResourceType,
                        isVisible: true,
                    },
                ],
            }

            const { container } = renderComponent({
                selectedOpportunity: unknownResourceOpportunity,
            })

            expect(
                screen.queryByTestId('opportunity-guidance-editor'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('opportunity-article-editor'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('opportunity-snippet-editor'),
            ).not.toBeInTheDocument()

            const resourceEditor = container.querySelector('.resourceEditor')
            if (resourceEditor) {
                expect(resourceEditor.children.length).toBe(0)
            }
        })
    })

    describe('Irrelevant Opportunity', () => {
        it('should not display banner when opportunity is relevant', () => {
            const relevantOpportunity: Opportunity = {
                ...mockOpportunity,
                isRelevant: true,
            }

            renderComponent({
                selectedOpportunity: relevantOpportunity,
            })

            expect(
                screen.queryByText(
                    'This opportunity is no longer relevant and was addressed by recent knowledge updates.',
                ),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /remove and view next/i }),
            ).not.toBeInTheDocument()
        })

        it('should display banner when opportunity is not relevant', () => {
            const irrelevantOpportunity: Opportunity = {
                ...mockOpportunity,
                isRelevant: false,
            }

            renderComponent({
                selectedOpportunity: irrelevantOpportunity,
            })

            expect(
                screen.getByText(
                    'This opportunity is no longer relevant and was addressed by recent knowledge updates.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /remove and view next/i }),
            ).toBeInTheDocument()
        })

        it('should display banner when isRelevant is undefined', () => {
            const opportunityWithUndefinedRelevance: Opportunity = {
                ...mockOpportunity,
                isRelevant: undefined,
            }

            renderComponent({
                selectedOpportunity: opportunityWithUndefinedRelevance,
            })

            expect(
                screen.queryByText(
                    'This opportunity is no longer relevant and was addressed by recent knowledge updates.',
                ),
            ).not.toBeInTheDocument()
        })

        it('should call onOpportunityRemoved when Remove and View Next button is clicked', async () => {
            const user = userEvent.setup()
            const onOpportunityRemoved = jest.fn()
            const irrelevantOpportunity: Opportunity = {
                ...mockOpportunity,
                isRelevant: false,
            }

            renderComponent({
                selectedOpportunity: irrelevantOpportunity,
                onOpportunityRemoved,
            })

            const removeButton = screen.getByRole('button', {
                name: /remove and view next/i,
            })
            await user.click(removeButton)

            expect(onOpportunityRemoved).toHaveBeenCalledTimes(1)
        })

        it('should render opportunity details when not relevant', () => {
            const irrelevantOpportunity: Opportunity = {
                ...mockOpportunity,
                isRelevant: false,
            }

            renderComponent({
                selectedOpportunity: irrelevantOpportunity,
            })

            expect(
                screen.getByTestId('opportunity-details-card'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('opportunity-guidance-editor'),
            ).toBeInTheDocument()
        })
    })
})
