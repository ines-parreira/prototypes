import React from 'react'

import { render } from '@testing-library/react'

import { OpportunitiesEmptyState } from './OpportunitiesEmptyState'

describe('OpportunitiesEmptyState', () => {
    it('should render the container', () => {
        const { container } = render(<OpportunitiesEmptyState />)

        const containerContent = container.querySelector('.containerContent')
        expect(containerContent).toBeInTheDocument()
    })

    it('should render the Gorgias icon SVG', () => {
        const { container } = render(<OpportunitiesEmptyState />)

        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('should have correct SVG attributes', () => {
        const { container } = render(<OpportunitiesEmptyState />)

        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('height', '111px')
        expect(svg).toHaveAttribute('viewBox', '0 0 56 56')
        expect(svg?.tagName).toBe('svg')
    })

    it('should render SVG inside container', () => {
        const { container } = render(<OpportunitiesEmptyState />)

        const containerContent = container.querySelector('.containerContent')
        const svg = containerContent?.querySelector('svg')
        expect(svg).toBeInTheDocument()
        expect(svg).toHaveAttribute('height', '111px')
    })

    it('should render SVG with correct fill', () => {
        const { container } = render(<OpportunitiesEmptyState />)

        const path = container.querySelector('svg path')
        expect(path).toBeInTheDocument()
        expect(path).toHaveAttribute('fill', 'currentColor')
    })
})
