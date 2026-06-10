import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import BookDemoContainer from '../BookDemoContainer'

describe('BookDemoContainer', () => {
    const mockOnBookDemo = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('renders the component with correct text content', () => {
            render(<BookDemoContainer onBookDemo={mockOnBookDemo} />)

            expect(screen.getByText('Let’s Talk?')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Book a demo' }),
            ).toBeInTheDocument()
        })
    })

    describe('User Interactions', () => {
        it('calls onBookDemo when button is clicked', async () => {
            const user = userEvent.setup()
            render(<BookDemoContainer onBookDemo={mockOnBookDemo} />)

            const button = screen.getByRole('button', { name: 'Book a demo' })
            await user.click(button)

            expect(mockOnBookDemo).toHaveBeenCalledTimes(1)
        })

        it('calls onBookDemo multiple times when button is clicked multiple times', async () => {
            const user = userEvent.setup()
            render(<BookDemoContainer onBookDemo={mockOnBookDemo} />)

            const button = screen.getByRole('button', { name: 'Book a demo' })
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
