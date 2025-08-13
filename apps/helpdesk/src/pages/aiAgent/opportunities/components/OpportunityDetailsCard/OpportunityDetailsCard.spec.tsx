import { render, screen } from '@testing-library/react'

import { OpportunityType } from '../../enums'
import { OpportunityDetailsCard } from './OpportunityDetailsCard'

describe('OpportunityDetails', () => {
    it('should render title and description for FILL_KNOWLEDGE_GAP type', () => {
        render(
            <OpportunityDetailsCard
                type={OpportunityType.FILL_KNOWLEDGE_GAP}
                title="What's your return policy?"
            />,
        )

        expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
        expect(
            screen.getByText(/Review and approve this AI-generated Guidance/),
        ).toBeInTheDocument()
    })

    it('should render title and description for RESOLVE_CONFLICT type', () => {
        render(
            <OpportunityDetailsCard
                type={OpportunityType.RESOLVE_CONFLICT}
                title="Topic"
            />,
        )

        expect(screen.getByText('Resolve conflict')).toBeInTheDocument()
        expect(
            screen.getByText(
                /Review and edit your content to resolve this conflict/,
            ),
        ).toBeInTheDocument()
    })

    it('should use custom description when provided', () => {
        const customDescription = 'This is a custom description'
        render(
            <OpportunityDetailsCard
                type={OpportunityType.FILL_KNOWLEDGE_GAP}
                title="Test Title"
                description={customDescription}
            />,
        )

        expect(screen.getByText(customDescription)).toBeInTheDocument()
    })

    it('should apply correct CSS classes', () => {
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
})
