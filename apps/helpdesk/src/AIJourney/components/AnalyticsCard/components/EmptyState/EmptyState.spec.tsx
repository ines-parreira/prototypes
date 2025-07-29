import { render, screen } from '@testing-library/react'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
    it('should render the default "No data available yet" text', () => {
        render(<EmptyState />)

        expect(screen.getByText('No data available yet')).toBeInTheDocument()
    })

    it('should render the default info text', () => {
        render(<EmptyState />)

        expect(
            screen.getByText(
                'Your Abandoned Cart has not collected any data yet.',
            ),
        ).toBeInTheDocument()
    })
})
