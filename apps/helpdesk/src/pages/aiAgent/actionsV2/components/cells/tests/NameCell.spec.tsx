import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { NameCell } from '../NameCell'

describe('NameCell', () => {
    it('renders the action name as-is when shorter than the limit', () => {
        render(<NameCell name="Cancel order" />)

        expect(screen.getByText('Cancel order')).toBeInTheDocument()
    })

    it('truncates long names with an ellipsis', () => {
        const longName = 'a'.repeat(80)

        render(<NameCell name={longName} />)

        expect(screen.queryByText(longName)).not.toBeInTheDocument()
        expect(screen.getByText(/a+…$/)).toBeInTheDocument()
    })
})
