import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

        it('calls callback when CTA button is clicked', async () => {
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

            await act(() => userEvent.click(button))

            expect(mockCallback).toHaveBeenCalledTimes(1)
        })
    })
})
