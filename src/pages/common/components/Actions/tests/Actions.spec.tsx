import { render, screen } from '@testing-library/react'

import Actions from '../Actions'

describe('Actions', () => {
    it('should render children', () => {
        render(<Actions>Child</Actions>)

        expect(screen.getByText('Child')).toBeInTheDocument()
    })
})
