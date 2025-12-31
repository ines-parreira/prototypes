import { render } from '@testing-library/react'

import { OpportunitiesContentSkeleton } from './OpportunitiesContentSkeleton'

describe('OpportunitiesContentSkeleton', () => {
    it('should render skeleton loaders', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const skeletons = container.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render two skeleton sections', () => {
        const { container } = render(<OpportunitiesContentSkeleton />)

        const guidanceNameSection = container.querySelector(
            '[class*="guidanceNameSection"]',
        )
        const instructionsSection = container.querySelector(
            '[class*="instructionsSection"]',
        )

        expect(guidanceNameSection).toBeInTheDocument()
        expect(instructionsSection).toBeInTheDocument()
    })
})
