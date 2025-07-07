import { render, screen } from '@testing-library/react'

import ActionsGroup from '../ActionsGroup'

describe('ActionsGroup', () => {
    it('should render children', () => {
        render(<ActionsGroup>Child</ActionsGroup>)

        expect(screen.getByText('Child')).toBeInTheDocument()
    })
})
