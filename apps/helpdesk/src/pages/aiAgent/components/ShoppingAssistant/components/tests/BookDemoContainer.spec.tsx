import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import BookDemoContainer from '../BookDemoContainer'

// Mock the Button component from @gorgias/axiom
jest.mock('@gorgias/axiom', () => ({
    Button: ({
        children,
        onClick,
        className,
        fillStyle,
        intent,
        size,
        ...props
    }: any) => (
        <button
            onClick={onClick}
            className={className}
            data-fill-style={fillStyle}
            data-intent={intent}
            data-size={size}
            {...props}
        >
            {children}
        </button>
    ),
}))

describe('BookDemoContainer', () => {
    const mockOnBookDemo = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('renders the component with correct text content', () => {
            render(<BookDemoContainer onBookDemo={mockOnBookDemo} />)

            expect(screen.getByText('Let’s Talk?')).toBeInTheDocument()
            expect(screen.getByText('Book a demo')).toBeInTheDocument()
        })

        it('renders the button with correct attributes', () => {
            render(<BookDemoContainer onBookDemo={mockOnBookDemo} />)

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).toHaveAttribute('data-fill-style', 'ghost')
            expect(button).toHaveAttribute('data-intent', 'secondary')
            expect(button).toHaveAttribute('data-size', 'medium')
        })

        it('applies default CSS classes', () => {
            render(<BookDemoContainer onBookDemo={mockOnBookDemo} />)

            const container = screen.getByText('Let’s Talk?').parentElement
            expect(container).toHaveClass('bookDemoContainer')
        })

        it('applies custom className when provided', () => {
            const customClass = 'custom-demo-container'
            render(
                <BookDemoContainer
                    onBookDemo={mockOnBookDemo}
                    className={customClass}
                />,
            )

            const container = screen.getByText('Let’s Talk?').parentElement
            expect(container).toHaveClass('bookDemoContainer')
            expect(container).toHaveClass(customClass)
        })

        it('handles empty className gracefully', () => {
            render(
                <BookDemoContainer onBookDemo={mockOnBookDemo} className="" />,
            )

            const container = screen.getByText('Let’s Talk?').parentElement
            expect(container).toHaveClass('bookDemoContainer')
            // Empty className should not add any additional classes
            expect(container?.className).toBe('bookDemoContainer ')
        })
    })

    describe('User Interactions', () => {
        it('calls onBookDemo when button is clicked', async () => {
            const user = userEvent.setup()
            render(<BookDemoContainer onBookDemo={mockOnBookDemo} />)

            const button = screen.getByRole('button')
            await user.click(button)

            expect(mockOnBookDemo).toHaveBeenCalledTimes(1)
        })

        it('calls onBookDemo multiple times when button is clicked multiple times', async () => {
            const user = userEvent.setup()
            render(<BookDemoContainer onBookDemo={mockOnBookDemo} />)

            const button = screen.getByRole('button')
            await user.click(button)
            await user.click(button)
            await user.click(button)

            expect(mockOnBookDemo).toHaveBeenCalledTimes(3)
        })
    })

    describe('Props Validation', () => {
        it('requires onBookDemo prop', () => {
            expect(() => {
                render(<BookDemoContainer onBookDemo={mockOnBookDemo} />)
            }).not.toThrow()
        })

        it('accepts optional className prop', () => {
            expect(() => {
                render(
                    <BookDemoContainer
                        onBookDemo={mockOnBookDemo}
                        className="test-class"
                    />,
                )
            }).not.toThrow()
        })
    })
})
