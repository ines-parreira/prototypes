import { render, screen } from '@testing-library/react'

import { OpportunityType } from '../../enums'
import { OpportunityDetailsCard } from './OpportunityDetailsCard'

interface Opportunity {
    id: string
    title: string
    content: string
    type: OpportunityType
}

const createMockOpportunity = (
    overrides?: Partial<Opportunity>,
): Opportunity => ({
    id: 'mock-opp-id',
    title: 'Mock Opportunity Title',
    content: 'Mock opportunity content',
    type: OpportunityType.FILL_KNOWLEDGE_GAP,
    ...overrides,
})

const createMockFillKnowledgeGapOpportunity = (
    overrides?: Partial<Opportunity>,
): Opportunity =>
    createMockOpportunity({
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        ...overrides,
    })

const createMockResolveConflictOpportunity = (
    overrides?: Partial<Opportunity>,
): Opportunity =>
    createMockOpportunity({
        type: OpportunityType.RESOLVE_CONFLICT,
        ...overrides,
    })

describe('OpportunityDetailsCard', () => {
    describe('Fill Knowledge Gap type', () => {
        it('should render title and default description', () => {
            const opportunity = createMockFillKnowledgeGapOpportunity({
                title: "What's your return policy?",
            })

            render(
                <OpportunityDetailsCard
                    type={opportunity.type}
                    title={opportunity.title}
                />,
            )

            expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Review and approve this AI-generated Guidance/,
                ),
            ).toBeInTheDocument()
        })

        it('should render heading with correct semantics', () => {
            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title="Test Title"
                />,
            )

            const heading = screen.getByRole('heading', {
                name: 'Fill knowledge gap',
            })
            expect(heading).toBeInTheDocument()
            expect(heading).toHaveClass('title')
        })

        it('should handle long titles appropriately', () => {
            const longTitle =
                'This is a very long title that represents a complex question from a customer that needs to be displayed properly'

            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title={longTitle}
                />,
            )

            expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
        })
    })

    describe('Resolve Conflict type', () => {
        it('should render title and default description', () => {
            const opportunity = createMockResolveConflictOpportunity({
                title: 'Topic',
            })

            render(
                <OpportunityDetailsCard
                    type={opportunity.type}
                    title={opportunity.title}
                />,
            )

            expect(screen.getByText('Resolve conflict')).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Review and edit your content to resolve this conflict/,
                ),
            ).toBeInTheDocument()
        })

        it('should render heading with correct semantics', () => {
            render(
                <OpportunityDetailsCard
                    type={OpportunityType.RESOLVE_CONFLICT}
                    title="Test Title"
                />,
            )

            const heading = screen.getByRole('heading', {
                name: 'Resolve conflict',
            })
            expect(heading).toBeInTheDocument()
            expect(heading).toHaveClass('title')
        })
    })

    describe('Custom description', () => {
        it('should use custom description when provided for FILL_KNOWLEDGE_GAP', () => {
            const customDescription =
                'This is a custom description for knowledge gap'

            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title="Test Title"
                    description={customDescription}
                />,
            )

            expect(screen.getByText(customDescription)).toBeInTheDocument()
            expect(
                screen.queryByText(
                    /Review and approve this AI-generated Guidance/,
                ),
            ).not.toBeInTheDocument()
        })

        it('should use custom description when provided for RESOLVE_CONFLICT', () => {
            const customDescription =
                'This is a custom description for conflict'

            render(
                <OpportunityDetailsCard
                    type={OpportunityType.RESOLVE_CONFLICT}
                    title="Test Title"
                    description={customDescription}
                />,
            )

            expect(screen.getByText(customDescription)).toBeInTheDocument()
            expect(
                screen.queryByText(
                    /Review and edit your content to resolve this conflict/,
                ),
            ).not.toBeInTheDocument()
        })

        it('should handle empty description gracefully', () => {
            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title="Test Title"
                    description=""
                />,
            )

            const descriptionElement = document.querySelector('.description')
            expect(descriptionElement).toBeInTheDocument()
            expect(descriptionElement).toHaveTextContent(
                /Review and approve this AI-generated Guidance/,
            )
        })
    })

    describe('CSS classes and structure', () => {
        it('should apply correct CSS classes for all elements', () => {
            const { container } = render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title="Test Title"
                />,
            )

            const containerElement = container.querySelector('.container')
            const titleElement = container.querySelector('.title')
            const descriptionElement = container.querySelector('.description')

            expect(containerElement).toBeInTheDocument()
            expect(titleElement).toBeInTheDocument()
            expect(descriptionElement).toBeInTheDocument()
        })

        it('should maintain proper nesting structure', () => {
            const { container } = render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title="Test Title"
                />,
            )

            const containerElement = container.querySelector('.container')
            const titleElement = containerElement?.querySelector('.title')
            const descriptionElement =
                containerElement?.querySelector('.description')

            expect(titleElement?.parentElement).toBe(containerElement)
            expect(descriptionElement?.parentElement).toBe(containerElement)
        })

        it('should render in correct order', () => {
            const { container } = render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title="Test Title"
                />,
            )

            const containerElement = container.querySelector('.container')
            const children = containerElement?.children

            expect(children?.[0]).toHaveClass('title')
            expect(children?.[1]).toHaveClass('description')
        })
    })

    describe('Edge cases', () => {
        it('should handle special characters in title', () => {
            const specialTitle = 'Test & Title <with> "special" characters'

            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title={specialTitle}
                />,
            )

            expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
        })

        it('should handle undefined values gracefully', () => {
            const { container } = render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title=""
                />,
            )

            expect(container.querySelector('.container')).toBeInTheDocument()
            expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
        })

        it('should render consistently across different opportunity types', () => {
            const { rerender, container } = render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    title="Test"
                />,
            )

            rerender(
                <OpportunityDetailsCard
                    type={OpportunityType.RESOLVE_CONFLICT}
                    title="Test"
                />,
            )

            expect(container.querySelector('.container')).toBeInTheDocument()
            expect(container.querySelector('.title')).toBeInTheDocument()
            expect(container.querySelector('.description')).toBeInTheDocument()
        })
    })
})
