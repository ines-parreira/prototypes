import { render } from '@testing-library/react'

import { OpportunitiesContentSkeleton } from './OpportunitiesContentSkeleton'

describe('OpportunitiesContentSkeleton', () => {
    it('should render skeleton loaders', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const skeletons = container.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render three skeleton sections', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const opportunityCard = container.querySelector(
            '[class*="opportunityCard"]',
        )
        const guidanceNameSection = container.querySelector(
            '[class*="guidanceNameSection"]',
        )
        const instructionsSection = container.querySelector(
            '[class*="instructionsSection"]',
        )

        expect(opportunityCard).toBeInTheDocument()
        expect(guidanceNameSection).toBeInTheDocument()
        expect(instructionsSection).toBeInTheDocument()
    })

    it('should render opportunity card section with correct skeleton count', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const opportunityCard = container.querySelector(
            '[class*="opportunityCard"]',
        )
        const skeletons = opportunityCard?.querySelectorAll(
            '[class*="skeleton"]',
        )

        expect(skeletons).toHaveLength(2)
    })

    it('should render guidance name section with input skeleton', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const guidanceNameSection = container.querySelector(
            '[class*="guidanceNameSection"]',
        )
        const inputContainer = guidanceNameSection?.querySelector(
            '[class*="guidanceNameSectionInput"]',
        )

        expect(inputContainer).toBeInTheDocument()
    })

    it('should render instructions section with multiple skeleton lines', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const instructionsSection = container.querySelector(
            '[class*="instructionsSection"]',
        )
        const inputContainer = instructionsSection?.querySelector(
            '[class*="instructionsSectionInput"]',
        )
        const skeletons = inputContainer?.querySelectorAll(
            '[class*="skeleton"]',
        )

        expect(skeletons && skeletons.length).toBeGreaterThan(5)
    })

    it('should render instructions section with separators', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const instructionsSection = container.querySelector(
            '[class*="instructionsSection"]',
        )
        const inputSeparator = instructionsSection?.querySelector(
            '[class*="instructionsSectionInputSeparator"]',
        )
        const bottomSeparator = instructionsSection?.querySelector(
            '[class*="instructionsSectionBottomSeparator"]',
        )

        expect(inputSeparator).toBeInTheDocument()
        expect(bottomSeparator).toBeInTheDocument()
    })

    it('should have correct layout structure', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const opportunityDetails = container.querySelector(
            '[class*="opportunityDetails"]',
        )

        expect(opportunityDetails?.childElementCount).toBe(3)
    })

    it('should render multiple skeleton elements in each section', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const opportunityCard = container.querySelector(
            '[class*="opportunityCard"]',
        )
        const guidanceNameSection = container.querySelector(
            '[class*="guidanceNameSection"]',
        )
        const instructionsSection = container.querySelector(
            '[class*="instructionsSection"]',
        )

        const cardSkeletons = opportunityCard?.querySelectorAll(
            '[class*="skeleton"]',
        )
        const guidanceSkeletons = guidanceNameSection?.querySelectorAll(
            '[class*="skeleton"]',
        )
        const instructionSkeletons = instructionsSection?.querySelectorAll(
            '[class*="skeleton"]',
        )

        expect(cardSkeletons && cardSkeletons.length).toBeGreaterThan(0)
        expect(guidanceSkeletons && guidanceSkeletons.length).toBeGreaterThan(0)
        expect(
            instructionSkeletons && instructionSkeletons.length,
        ).toBeGreaterThan(0)
    })

    it('should render with proper hierarchy', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const opportunityDetails = container.firstChild
        const sections = opportunityDetails?.childNodes

        expect(sections).toHaveLength(3)
    })
})
