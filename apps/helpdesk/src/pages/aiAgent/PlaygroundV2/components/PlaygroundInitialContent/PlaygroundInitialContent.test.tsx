import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PlaygroundInitialContent } from './PlaygroundInitialContent'

describe('PlaygroundInitialContent', () => {
    describe('Rendering', () => {
        it('should render with correct title', () => {
            render(<PlaygroundInitialContent />)

            expect(
                screen.getByText('Preview shopper experience'),
            ).toBeInTheDocument()
        })

        it('should render with correct description', () => {
            render(<PlaygroundInitialContent />)

            expect(
                screen.getByText(
                    /AI Agent will use your stores' resources and order history to respond/i,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Preview conversations won't send messages or take any real actions/i,
                ),
            ).toBeInTheDocument()
        })

        it('should render AI icon', () => {
            const { container } = render(<PlaygroundInitialContent />)

            // Icon is rendered by Axiom Icon component
            const iconContainer = container.querySelector('[class*="icon"]')
            expect(iconContainer).toBeInTheDocument()
        })
    })

    describe('With Button (Outbound Mode)', () => {
        const mockOnStartClick = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should render button when onStartClick is provided', () => {
            render(<PlaygroundInitialContent onStartClick={mockOnStartClick} />)

            const button = screen.getByRole('button', {
                name: /start conversation/i,
            })
            expect(button).toBeInTheDocument()
        })

        it('should call onStartClick when button is clicked', async () => {
            const user = userEvent.setup()
            render(<PlaygroundInitialContent onStartClick={mockOnStartClick} />)

            const button = screen.getByRole('button', {
                name: /start conversation/i,
            })
            await user.click(button)

            expect(mockOnStartClick).toHaveBeenCalledTimes(1)
        })

        it('should not show loading state by default', () => {
            render(<PlaygroundInitialContent onStartClick={mockOnStartClick} />)

            const button = screen.getByRole('button', {
                name: /start conversation/i,
            })
            expect(button).not.toHaveAttribute('aria-busy', 'true')
        })

        it('should be disabled when isLoading is true', () => {
            render(
                <PlaygroundInitialContent
                    onStartClick={mockOnStartClick}
                    isLoading={true}
                />,
            )

            const button = screen.getByRole('button', {
                name: /start conversation/i,
            })
            expect(button).toBeDisabled()
        })
    })

    describe('Without Button (Inbound Mode)', () => {
        it('should not render button when onStartClick is not provided', () => {
            render(<PlaygroundInitialContent />)

            const buttons = screen.queryAllByRole('button')
            expect(buttons).toHaveLength(0)
        })

        it('should still render icon and text without button', () => {
            const { container } = render(<PlaygroundInitialContent />)

            expect(
                screen.getByText('Preview shopper experience'),
            ).toBeInTheDocument()
            const iconContainer = container.querySelector('[class*="icon"]')
            expect(iconContainer).toBeInTheDocument()
        })
    })
})
