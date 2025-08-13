import React from 'react'

import { render, screen } from '@testing-library/react'

import { OpportunitiesLayout } from './OpportunitiesLayout'

describe('OpportunitiesLayout', () => {
    it('should render sidebar and content components', () => {
        render(<OpportunitiesLayout />)

        expect(screen.getByText('Available opportunities')).toBeInTheDocument()
        expect(screen.getByText('Opportunities')).toBeInTheDocument()
    })

    it('should render sidebar with mock opportunities', () => {
        render(<OpportunitiesLayout />)

        expect(screen.getByText('Available opportunities')).toBeInTheDocument()
        expect(screen.getByText('4 items')).toBeInTheDocument()
        expect(
            screen.getByText("What's your return policy?"),
        ).toBeInTheDocument()
    })

    it('should render content with selected opportunity details', () => {
        render(<OpportunitiesLayout />)

        // First opportunity should be selected by default
        // Check for the heading in the details section
        const headings = screen.getAllByRole('heading', {
            name: 'Fill knowledge gap',
        })
        expect(headings.length).toBeGreaterThan(0)

        expect(
            screen.getByText(/Review and approve this AI-generated Guidance/),
        ).toBeInTheDocument()
    })

    it('should have correct wrapper attributes', () => {
        const { container } = render(<OpportunitiesLayout />)

        const wrapper = container.querySelector('[data-ai-opportunities]')
        expect(wrapper).toBeInTheDocument()
        expect(wrapper).toHaveAttribute('data-overflow', 'visible')
    })

    it('should render layout with proper structure', () => {
        const { container } = render(<OpportunitiesLayout />)

        const layoutElement = container.querySelector('.layout')
        expect(layoutElement).toBeInTheDocument()
        expect(layoutElement?.children).toHaveLength(2)
    })
})
