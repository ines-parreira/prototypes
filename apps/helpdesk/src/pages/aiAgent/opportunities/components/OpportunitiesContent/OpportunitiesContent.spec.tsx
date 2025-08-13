import React from 'react'

import { render, screen } from '@testing-library/react'

import { OpportunityType } from '../../enums'
import { Opportunity } from '../OpportunitiesLayout/OpportunitiesLayout'
import { OpportunitiesContent } from './OpportunitiesContent'

describe('OpportunitiesContent', () => {
    it('should render content header with title', () => {
        render(<OpportunitiesContent selectedOpportunity={null} />)

        const title = screen.getByRole('heading', { name: 'Opportunities' })
        expect(title).toBeInTheDocument()
        expect(title).toHaveClass('title')
    })

    it('should render empty state when no opportunity is selected', () => {
        render(<OpportunitiesContent selectedOpportunity={null} />)

        expect(screen.getByText('No opportunities yet')).toBeInTheDocument()
        expect(
            screen.getByText(/AI Agent will start finding opportunities/),
        ).toBeInTheDocument()
    })

    it('should render OpportunityDetails when an opportunity is selected', () => {
        const selectedOpportunity: Opportunity = {
            id: '1',
            title: "What's your return policy?",
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        }

        render(
            <OpportunitiesContent selectedOpportunity={selectedOpportunity} />,
        )

        expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
        expect(
            screen.getByText(/Review and approve this AI-generated Guidance/),
        ).toBeInTheDocument()
    })

    it('should have proper content structure', () => {
        const { container } = render(
            <OpportunitiesContent selectedOpportunity={null} />,
        )

        const containerContent = container.querySelector('.containerContent')
        expect(containerContent).toBeInTheDocument()

        const header = container.querySelector('.header')
        expect(header).toBeInTheDocument()

        const contentBody = container.querySelector('.contentBody')
        expect(contentBody).toBeInTheDocument()
    })

    it('should render OpportunitiesEmptyState inside content body when no selection', () => {
        const { container } = render(
            <OpportunitiesContent selectedOpportunity={null} />,
        )

        const contentBody = container.querySelector('.contentBody')
        expect(contentBody).toBeInTheDocument()

        const emptyStateTitle = screen.getByText('No opportunities yet')
        expect(contentBody).toContainElement(emptyStateTitle)
    })

    it('should display complete empty state message when no selection', () => {
        render(<OpportunitiesContent selectedOpportunity={null} />)

        const description = screen.getByText(
            /AI Agent will start finding opportunities to improve as/,
        )
        expect(description).toBeInTheDocument()

        const secondLine = screen.getByText(
            /it learns from conversations with your customers/,
        )
        expect(secondLine).toBeInTheDocument()
    })

    it('should render correct details for RESOLVE_CONFLICT type', () => {
        const selectedOpportunity: Opportunity = {
            id: '2',
            title: 'Topic',
            type: OpportunityType.RESOLVE_CONFLICT,
        }

        render(
            <OpportunitiesContent selectedOpportunity={selectedOpportunity} />,
        )

        expect(screen.getByText('Resolve conflict')).toBeInTheDocument()
        expect(
            screen.getByText(
                /Review and edit your content to resolve this conflict/,
            ),
        ).toBeInTheDocument()
    })
})
