import React from 'react'

import { render, screen } from '@testing-library/react'

import { OpportunitiesEmptyState } from './OpportunitiesEmptyState'

describe('OpportunitiesEmptyState', () => {
    it('should render empty state title', () => {
        render(<OpportunitiesEmptyState />)

        const title = screen.getByRole('heading', {
            name: 'No opportunities yet',
        })
        expect(title).toBeInTheDocument()
        expect(title).toHaveClass('title')
    })

    it('should render empty state description', () => {
        render(<OpportunitiesEmptyState />)

        const description = screen.getByText(
            /AI Agent will start finding opportunities to improve as/,
        )
        expect(description).toBeInTheDocument()
    })

    it('should render complete description text with line break', () => {
        render(<OpportunitiesEmptyState />)

        const secondLine = screen.getByText(
            /it learns from conversations with your customers/,
        )
        expect(secondLine).toBeInTheDocument()
    })

    it('should have proper structure with container and empty state divs', () => {
        const { container } = render(<OpportunitiesEmptyState />)

        const containerContent = container.querySelector('.containerContent')
        expect(containerContent).toBeInTheDocument()

        const emptyState = container.querySelector('.emptyState')
        expect(emptyState).toBeInTheDocument()
    })

    it('should render description as a paragraph element', () => {
        const { container } = render(<OpportunitiesEmptyState />)

        const description = container.querySelector('.description')
        expect(description).toBeInTheDocument()
        expect(description?.tagName).toBe('P')
    })

    it('should contain br element in description for line break', () => {
        const { container } = render(<OpportunitiesEmptyState />)

        const description = container.querySelector('.description')
        const brElement = description?.querySelector('br')
        expect(brElement).toBeInTheDocument()
    })
})
