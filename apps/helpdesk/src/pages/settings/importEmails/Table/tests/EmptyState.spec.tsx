import { render, screen } from '@testing-library/react'

import EmptyState from '../EmptyState'

describe('EmptyState', () => {
    describe('Default rendering', () => {
        it('renders with default title and description', () => {
            render(<EmptyState onOpenCreateImportModal={() => ({})} />)

            expect(screen.getByText('No emails imported')).toBeInTheDocument()

            expect(
                screen.getByText('Select an email to get started.'),
            ).toBeInTheDocument()
        })
    })
})
