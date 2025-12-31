import { render } from '@testing-library/react'

import { OpportunityCardSkeleton } from './OpportunityCardSkeleton'

describe('OpportunityCardSkeleton', () => {
    it('should render skeleton elements', () => {
        const { container } = render(<OpportunityCardSkeleton />)

        const skeletons = container.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })
})
