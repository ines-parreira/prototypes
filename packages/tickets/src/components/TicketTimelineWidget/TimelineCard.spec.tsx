import { render, screen } from '@testing-library/react'

import { TimelineCard } from './TimelineCard'

describe('TimelineCard', () => {
    it('should render children', () => {
        render(
            <TimelineCard>
                <div>Test Content</div>
            </TimelineCard>,
        )

        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
        const { container } = render(
            <TimelineCard className="custom-class">
                <div>Test Content</div>
            </TimelineCard>,
        )

        const cardElement = container.querySelector('.custom-class')
        expect(cardElement).toBeInTheDocument()
    })

    it('should render with Card component', () => {
        const { container } = render(
            <TimelineCard>
                <div>Test Content</div>
            </TimelineCard>,
        )

        // Should render Card component
        const cardElement = container.querySelector('[class*="card"]')
        expect(cardElement).toBeInTheDocument()
    })
})
