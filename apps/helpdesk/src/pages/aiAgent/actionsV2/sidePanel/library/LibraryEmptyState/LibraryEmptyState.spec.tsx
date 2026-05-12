import { render } from '@repo/testing'

import { LibraryEmptyState } from './LibraryEmptyState'

describe('LibraryEmptyState', () => {
    it('renders the default empty state copy', () => {
        const { getByText } = render(<LibraryEmptyState />)
        expect(getByText('No actions found')).toBeInTheDocument()
        expect(getByText('Try a different search')).toBeInTheDocument()
    })

    it('links the Request app button to the actions request URL', () => {
        const { getByRole } = render(<LibraryEmptyState />)
        const link = getByRole('link', { name: 'Request app' })
        expect(link).toHaveAttribute('href', 'https://link.gorgias.com/actions')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer')
    })

    it('allows overriding the request URL and copy', () => {
        const { getByRole, getByText } = render(
            <LibraryEmptyState
                title="No matches"
                description="Adjust your filters"
                requestAppUrl="https://example.com/request"
            />,
        )
        expect(getByText('No matches')).toBeInTheDocument()
        expect(getByText('Adjust your filters')).toBeInTheDocument()
        expect(getByRole('link', { name: 'Request app' })).toHaveAttribute(
            'href',
            'https://example.com/request',
        )
    })
})
