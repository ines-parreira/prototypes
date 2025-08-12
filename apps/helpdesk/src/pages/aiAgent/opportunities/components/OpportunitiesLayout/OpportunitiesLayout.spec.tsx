import React from 'react'

import { render, screen } from '@testing-library/react'

import { OpportunitiesLayout } from './OpportunitiesLayout'

describe('OpportunitiesLayout', () => {
    it('should render sidebar and content components', () => {
        render(<OpportunitiesLayout />)

        expect(screen.getByText('Available opportunities')).toBeInTheDocument()
        expect(screen.getByText('Opportunities')).toBeInTheDocument()
    })

    it('should render sidebar with correct content', () => {
        render(<OpportunitiesLayout />)

        expect(screen.getByText('Available opportunities')).toBeInTheDocument()
        expect(screen.getByText('0 items')).toBeInTheDocument()
    })

    it('should render content with empty state', () => {
        render(<OpportunitiesLayout />)

        expect(screen.getByText('No opportunities yet')).toBeInTheDocument()
        expect(
            screen.getByText(/AI Agent will start finding opportunities/),
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
