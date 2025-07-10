import { render, screen } from '@testing-library/react'

import FormActionsGroup from '../components/FormActionsGroup'

describe('FormActionsGroup', () => {
    it('should render children', () => {
        render(<FormActionsGroup>Child</FormActionsGroup>)

        expect(screen.getByText('Child')).toBeInTheDocument()
    })
})
