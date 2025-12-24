import React from 'react'

import { render, screen } from '@testing-library/react'

import FormActionsGroup from '../FormActionsGroup'

describe('FormActionsGroup', () => {
    it('should render children', () => {
        render(<FormActionsGroup>Child</FormActionsGroup>)

        expect(screen.getByText('Child')).toBeInTheDocument()
    })
})
