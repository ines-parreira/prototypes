import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
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
        opportunity,
        shopName,
        onValuesChange,
        isInGuidanceEditorModeOnly,
    }: any) => (
        <div data-testid="opportunity-guidance-editor">
            <div>Opportunity: {opportunity.title}</div>
            <div>Shop: {shopName}</div>
            <div>Editor Mode: {String(isInGuidanceEditorModeOnly)}</div>
            <input
                placeholder="Title"
                onChange={(e) =>
                    onValuesChange({
                        title: e.target.value,
                        body: opportunity.content,
                        isVisible: true,
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
    title: 'Test Opportunity',
    content: 'Test content',
    ticketCount: 5,
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
                screen.getByText('Opportunity: Test Opportunity'),
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
            expect(onFormValuesChange).toHaveBeenCalledWith({
                title: 'New',
                body: 'Test content',
                isVisible: true,
            })
        })
    })

    describe('Resolve Conflict Opportunities', () => {
        it('should return null for conflict opportunities (not yet implemented)', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            const { container } = renderComponent({
                selectedOpportunity: conflictOpportunity,
            })

            expect(container.firstChild).toBeNull()
        })

        it('should not render OpportunityDetailsCard for conflicts', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
            })

            expect(
                screen.queryByTestId('opportunity-details-card'),
            ).not.toBeInTheDocument()
        })

        it('should not render OpportunityGuidanceEditor for conflicts', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
            })

            expect(
                screen.queryByTestId('opportunity-guidance-editor'),
            ).not.toBeInTheDocument()
        })
    })
})
