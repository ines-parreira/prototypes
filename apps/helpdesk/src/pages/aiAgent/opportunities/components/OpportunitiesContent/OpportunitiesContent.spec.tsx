import React from 'react'

import { render, screen } from '@testing-library/react'

import { OpportunitiesContent } from './OpportunitiesContent'

describe('OpportunitiesContent', () => {
    it('should render content header with title', () => {
        render(<OpportunitiesContent />)

        const title = screen.getByRole('heading', { name: 'Opportunities' })
        expect(title).toBeInTheDocument()
        expect(title).toHaveClass('title')
    })

    it('should render empty state component', () => {
        render(<OpportunitiesContent />)

        expect(screen.getByText('No opportunities yet')).toBeInTheDocument()
        expect(
            screen.getByText(/AI Agent will start finding opportunities/),
        ).toBeInTheDocument()
    })

    it('should have proper content structure', () => {
        const { container } = render(<OpportunitiesContent />)

        const containerContent = container.querySelector('.containerContent')
        expect(containerContent).toBeInTheDocument()

        const header = container.querySelector('.header')
        expect(header).toBeInTheDocument()

        const contentBody = container.querySelector('.contentBody')
        expect(contentBody).toBeInTheDocument()
    })

    it('should render OpportunitiesEmptyState inside content body', () => {
        const { container } = render(<OpportunitiesContent />)

        const contentBody = container.querySelector('.contentBody')
        expect(contentBody).toBeInTheDocument()

        const emptyStateTitle = screen.getByText('No opportunities yet')
        expect(contentBody).toContainElement(emptyStateTitle)
    })

    it('should display complete empty state message', () => {
        render(<OpportunitiesContent />)

        const description = screen.getByText(
            /AI Agent will start finding opportunities to improve as/,
        )
        expect(description).toBeInTheDocument()

        const secondLine = screen.getByText(
            /it learns from conversations with your customers/,
        )
        expect(secondLine).toBeInTheDocument()
    })
})
