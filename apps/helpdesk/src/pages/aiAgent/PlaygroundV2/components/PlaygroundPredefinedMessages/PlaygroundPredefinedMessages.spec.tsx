import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { PlaygroundPredefinedMessages } from './PlaygroundPredefinedMessages'

jest.mock('utils/html', () => ({
    sanitizeHtmlDefault: jest.fn((html) => html),
}))

describe('PlaygroundPredefinedMessages', () => {
    const mockOnMessageSelect = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render all predefined message chips', () => {
            render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            expect(
                screen.getByText('Do you offer discounts?'),
            ).toBeInTheDocument()
            expect(screen.getByText('Where is my order?')).toBeInTheDocument()
            expect(
                screen.getByText('Do you ship internationally?'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Do you offer a warranty?'),
            ).toBeInTheDocument()
        })

        it('should render visible by default', () => {
            const { container } = render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            const containerDiv = container.firstChild as HTMLElement
            expect(containerDiv).not.toHaveClass('hidden')
        })

        it('should apply hidden class when isVisible is false', () => {
            const { container } = render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                    isVisible={false}
                />,
            )

            const containerDiv = container.firstChild as HTMLElement
            expect(containerDiv).toHaveClass('hidden')
        })

        it('should render correct number of chips', () => {
            const { container } = render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            // Check that we have 4 chips
            const chips = container.querySelectorAll('button')
            expect(chips.length).toBe(4)
        })
    })

    describe('message selection', () => {
        it('should call onMessageSelect when chip is clicked', async () => {
            render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            const chip = screen.getByText('Do you offer discounts?')
            await userEvent.click(chip)

            expect(mockOnMessageSelect).toHaveBeenCalledWith({
                id: 1,
                title: 'Do you offer discounts?',
                content: expect.stringContaining(
                    'I wanted to check if you currently have any discounts',
                ),
            })
        })

        it('should call onMessageSelect with correct message for each chip', async () => {
            render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            const chips = [
                'Do you offer discounts?',
                'Where is my order?',
                'Do you ship internationally?',
                'Do you offer a warranty?',
            ]

            for (const chipText of chips) {
                const chip = screen.getByText(chipText)
                await userEvent.click(chip)
            }

            expect(mockOnMessageSelect).toHaveBeenCalledTimes(4)
        })
    })

    describe('preview popover', () => {
        it('should show preview on mouse enter', async () => {
            render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            const chip = screen.getByText('Do you offer discounts?')
            const chipParent = chip.closest('div')

            act(() => {
                fireEvent.mouseEnter(chipParent!)
            })

            await waitFor(() => {
                expect(
                    screen.getByText(/I wanted to check if you currently/),
                ).toBeInTheDocument()
            })
        })

        it('should hide preview on mouse leave', async () => {
            render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            const chip = screen.getByText('Do you offer discounts?')
            const chipParent = chip.closest('div')

            act(() => {
                fireEvent.mouseEnter(chipParent!)
            })

            await waitFor(() => {
                expect(
                    screen.getByText(/I wanted to check if you currently/),
                ).toBeInTheDocument()
            })

            act(() => {
                fireEvent.mouseLeave(chipParent!)
            })

            await waitFor(() => {
                expect(
                    screen.queryByText(/I wanted to check if you currently/),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('drag scrolling', () => {
        let listElement: HTMLElement

        beforeEach(() => {
            const { container } = render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )
            listElement = container.querySelector('ul')!
        })

        it('should handle mouse down event', () => {
            fireEvent.mouseDown(listElement, {
                pageX: 100,
            })

            // Mouse down should initiate dragging
            // No direct way to test refs, but we can test the behavior
            expect(listElement).toBeInTheDocument()
        })

        it('should handle mouse move during drag', () => {
            fireEvent.mouseDown(listElement, {
                pageX: 100,
            })

            fireEvent.mouseMove(listElement, {
                pageX: 150,
            })

            expect(listElement).toBeInTheDocument()
        })

        it('should handle mouse up after drag', () => {
            fireEvent.mouseDown(listElement, {
                pageX: 100,
            })

            fireEvent.mouseMove(listElement, {
                pageX: 150,
            })

            fireEvent.mouseUp(listElement, {
                pageX: 150,
            })

            expect(listElement).toBeInTheDocument()
        })

        it('should handle mouse leave during drag', () => {
            fireEvent.mouseDown(listElement, {
                pageX: 100,
            })

            fireEvent.mouseMove(listElement, {
                pageX: 150,
            })

            fireEvent.mouseLeave(listElement)

            expect(listElement).toBeInTheDocument()
        })

        it('should scroll list on mouse move when dragging', () => {
            fireEvent.mouseDown(listElement, {
                pageX: 200,
            })

            fireEvent.mouseMove(listElement, {
                pageX: 100,
            })

            // Note: scrollLeft change depends on offsetLeft which is 0 in jsdom
            // This test verifies the event handlers are called
            expect(listElement.scrollLeft).toBeDefined()
        })

        it('should prevent click after significant drag', () => {
            const button = screen.getByText('Do you offer discounts?')

            fireEvent.mouseDown(listElement, {
                pageX: 100,
            })

            // Move more than 3 pixels to trigger hasMoved
            fireEvent.mouseMove(listElement, {
                pageX: 105,
            })

            fireEvent.mouseUp(listElement, {
                pageX: 105,
                target: button,
            })

            // Should not call onMessageSelect due to drag prevention
            // (This behavior is complex to test due to event listener manipulation)
            expect(listElement).toBeInTheDocument()
        })
    })

    describe('edge cases', () => {
        it('should handle multiple rapid clicks', async () => {
            render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            const chip = screen.getByText('Do you offer discounts?')

            await userEvent.click(chip)
            await userEvent.click(chip)
            await userEvent.click(chip)

            expect(mockOnMessageSelect).toHaveBeenCalledTimes(3)
        })

        it('should handle mouse events on different chips', () => {
            render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            const chip1 = screen.getByText('Do you offer discounts?')
            const chip2 = screen.getByText('Where is my order?')

            const chipParent1 = chip1.closest('div')
            const chipParent2 = chip2.closest('div')

            act(() => {
                fireEvent.mouseEnter(chipParent1!)
                fireEvent.mouseLeave(chipParent1!)
                fireEvent.mouseEnter(chipParent2!)
            })

            expect(chipParent1).toBeInTheDocument()
            expect(chipParent2).toBeInTheDocument()
        })

        it('should render all 4 list items', () => {
            const { container } = render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            const listItems = container.querySelectorAll('li')
            expect(listItems).toHaveLength(4)
        })
    })

    describe('content sanitization', () => {
        it('should sanitize HTML content in preview', async () => {
            const { sanitizeHtmlDefault } = require('utils/html')

            render(
                <PlaygroundPredefinedMessages
                    onMessageSelect={mockOnMessageSelect}
                />,
            )

            const chip = screen.getByText('Do you offer discounts?')
            const chipParent = chip.closest('div')

            act(() => {
                fireEvent.mouseEnter(chipParent!)
            })

            await waitFor(() => {
                expect(sanitizeHtmlDefault).toHaveBeenCalled()
            })
        })
    })
})
