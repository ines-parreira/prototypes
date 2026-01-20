import { render, screen } from '@testing-library/react'
import defaultUserEvent from '@testing-library/user-event'
import { vi } from 'vitest'

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

    it('should not render clickable wrapper when onClick is not provided', () => {
        const { container } = render(
            <TimelineCard>
                <div>Test Content</div>
            </TimelineCard>,
        )

        // Should not have a div with cursor: pointer style
        const clickableDiv = container.querySelector(
            '[style*="cursor: pointer"]',
        )
        expect(clickableDiv).not.toBeInTheDocument()
    })

    it('should render clickable wrapper when onClick is provided', () => {
        const mockOnClick = vi.fn()

        const { container } = render(
            <TimelineCard onClick={mockOnClick}>
                <div>Test Content</div>
            </TimelineCard>,
        )

        // Should have a div with cursor: pointer style
        const clickableDiv = container.querySelector(
            '[style*="cursor: pointer"]',
        )
        expect(clickableDiv).toBeInTheDocument()
    })

    it('should call onClick handler when card is clicked', async () => {
        const mockOnClick = vi.fn()

        const { container } = render(
            <TimelineCard onClick={mockOnClick}>
                <div>Test Content</div>
            </TimelineCard>,
        )

        // Get the clickable wrapper div
        const clickableDiv = container.querySelector(
            '[style*="cursor: pointer"]',
        ) as HTMLElement

        expect(clickableDiv).toBeInTheDocument()

        // Click the card
        await defaultUserEvent.click(clickableDiv)

        // Verify onClick was called
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should call onClick handler when clicking child elements', async () => {
        const mockOnClick = vi.fn()

        render(
            <TimelineCard onClick={mockOnClick}>
                <div>Test Content</div>
            </TimelineCard>,
        )

        // Click the child content
        const content = screen.getByText('Test Content')
        await defaultUserEvent.click(content)

        // Verify onClick was called (event bubbles up)
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should call onClick multiple times when clicked multiple times', async () => {
        const mockOnClick = vi.fn()

        const { container } = render(
            <TimelineCard onClick={mockOnClick}>
                <div>Test Content</div>
            </TimelineCard>,
        )

        const clickableDiv = container.querySelector(
            '[style*="cursor: pointer"]',
        ) as HTMLElement

        // Click multiple times
        await defaultUserEvent.click(clickableDiv)
        await defaultUserEvent.click(clickableDiv)
        await defaultUserEvent.click(clickableDiv)

        // Verify onClick was called 3 times
        expect(mockOnClick).toHaveBeenCalledTimes(3)
    })
})
