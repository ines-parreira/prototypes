import { render, screen } from '@testing-library/react'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
    it('should render the default info text', () => {
        render(<EmptyState journeyType="Cart Abandoned" />)

        expect(screen.getByText('No data available')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Your Cart Abandoned has not collected any data yet.',
            ),
        ).toBeInTheDocument()
    })
})
