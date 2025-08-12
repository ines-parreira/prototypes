import React from 'react'

import { render, screen } from '@testing-library/react'

import { OpportunitiesSidebar } from './OpportunitiesSidebar'

describe('OpportunitiesSidebar', () => {
    it('should render sidebar header with title', () => {
        render(<OpportunitiesSidebar />)

        const title = screen.getByRole('heading', {
            name: 'Available opportunities',
        })
        expect(title).toBeInTheDocument()
        expect(title).toHaveClass('title')
    })

    it('should render empty state when no items', () => {
        render(<OpportunitiesSidebar />)

        expect(screen.getByText('0 items')).toBeInTheDocument()
    })

    it('should have proper structure with header and content sections', () => {
        const { container } = render(<OpportunitiesSidebar />)

        const sidebar = container.querySelector('.sidebar')
        expect(sidebar).toBeInTheDocument()

        const header = container.querySelector('.header')
        expect(header).toBeInTheDocument()

        const containerContent = container.querySelector('.containerContent')
        expect(containerContent).toBeInTheDocument()
    })

    it('should render empty state in content container', () => {
        const { container } = render(<OpportunitiesSidebar />)

        const emptyState = container.querySelector('.emptyState')
        expect(emptyState).toBeInTheDocument()
        expect(emptyState).toHaveTextContent('0 items')
    })
})
