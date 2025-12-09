import { render, screen } from '@testing-library/react'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
    describe('Default rendering', () => {
        it('renders with provided title and description', () => {
            render(
                <EmptyState
                    title="No emails imported"
                    description="Select an email to get started."
                    ctaButtonCallback={() => ({})}
                    ctaButtonLabel="Import Email"
                />,
            )

            expect(screen.getByText('No emails imported')).toBeInTheDocument()

            expect(
                screen.getByText('Select an email to get started.'),
            ).toBeInTheDocument()

            expect(
                screen.getByRole('button', { name: 'Import Email' }),
            ).toBeInTheDocument()
        })

        it('calls callback when CTA button is clicked', () => {
            const mockCallback = jest.fn()

            render(
                <EmptyState
                    title="Test Title"
                    description="Test Description"
                    ctaButtonCallback={mockCallback}
                    ctaButtonLabel="Click Me"
                />,
            )

            const button = screen.getByRole('button', { name: 'Click Me' })
            button.click()

            expect(mockCallback).toHaveBeenCalledTimes(1)
        })
    })
})
