import { render, screen } from '@testing-library/react'

import VisibilityChip from './VisibilityChip'

describe('VisibilityChip', () => {
    it('should render Hidden text', () => {
        render(<VisibilityChip />)

        expect(screen.getByText('Hidden')).toBeInTheDocument()
    })
})
