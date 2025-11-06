import { render } from '@testing-library/react'

import { OpportunityCardSkeleton } from './OpportunityCardSkeleton'

describe('OpportunityCardSkeleton', () => {
    it('should render skeleton elements', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const skeletons = container.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render card container', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const card = container.querySelector('.card')
        expect(card).toBeInTheDocument()
    })

    it('should render header section', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const header = container.querySelector('.header')
        expect(header).toBeInTheDocument()
    })

    it('should render info section', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const infoSection = container.querySelector('.infoSection')
        expect(infoSection).toBeInTheDocument()
    })

    it('should render with correct skeleton dimensions', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const headerSkeleton = container.querySelector(
            '.header [class*="skeleton"]',
        )
        expect(headerSkeleton).toBeInTheDocument()

        const infoSkeletons = container.querySelectorAll(
            '.infoSection [class*="skeleton"]',
        )
        expect(infoSkeletons).toHaveLength(2)
    })

    it('should have accessible structure', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const card = container.firstChild
        expect(card).toHaveClass('card')

        const childElements = card?.childNodes
        expect(childElements).toHaveLength(2)
    })

    it('should render circular skeleton for icon', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const circularSkeleton = container.querySelector(
            '.infoSection [class*="skeleton"]:first-child',
        )
        expect(circularSkeleton).toBeInTheDocument()
    })

    it('should render correct skeleton layout structure', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const card = container.querySelector('.card')
        const header = card?.querySelector('.header')
        const infoSection = card?.querySelector('.infoSection')

        expect(header?.parentElement).toBe(card)
        expect(infoSection?.parentElement).toBe(card)
    })

    it('should apply custom cardContainerClassName when provided', () => {
        const customClass = 'custom-skeleton-class'
        const { container } = render(
            <OpportunityCardSkeleton cardContainerClassName={customClass} />,
        )

        const card = container.firstChild as HTMLElement
        expect(card).toHaveClass(customClass)
    })

    it('should not apply additional class when cardContainerClassName is not provided', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const card = container.firstChild as HTMLElement
        expect(card.className).not.toContain('undefined')
    })
})
