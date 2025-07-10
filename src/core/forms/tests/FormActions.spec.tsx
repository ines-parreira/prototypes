import { render, screen } from '@testing-library/react'

import FormActions from '../components/FormActions'

describe('FormActions', () => {
    it('should render children', () => {
        render(<FormActions>Child</FormActions>)

        expect(screen.getByText('Child')).toBeInTheDocument()
    })
})
