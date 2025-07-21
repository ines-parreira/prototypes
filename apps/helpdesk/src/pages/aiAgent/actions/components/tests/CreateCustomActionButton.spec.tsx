import React from 'react'

import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import CreateCustomActionButton from '../CreateCustomActionButton'

describe('<CreateCustomActionButton />', () => {
    it('should render component', () => {
        renderWithRouter(<CreateCustomActionButton />)

        expect(screen.getByText('Create Custom Action')).toBeInTheDocument()
    })
})
