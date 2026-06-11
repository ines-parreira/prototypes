import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { BrowseAllActionsButton } from '../BrowseAllActionsButton'

describe('<BrowseAllActionsButton />', () => {
    it('should render component', () => {
        render(<BrowseAllActionsButton />)
        expect(screen.getByText('Create from template')).toBeInTheDocument()
    })

    it('renders a link to the action templates page so navigation stays client-side', () => {
        render(<BrowseAllActionsButton />)

        const link = screen.getByRole('link', { name: /create from template/i })
        expect(link).toHaveAttribute(
            'href',
            expect.stringContaining('/actions/templates'),
        )
    })
})
