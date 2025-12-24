import React from 'react'

import { render, screen } from '@testing-library/react'

import FormActions from '../FormActions'

describe('FormActions', () => {
    it('should render children', () => {
        render(<FormActions>Child</FormActions>)

        expect(screen.getByText('Child')).toBeInTheDocument()
    })
})
