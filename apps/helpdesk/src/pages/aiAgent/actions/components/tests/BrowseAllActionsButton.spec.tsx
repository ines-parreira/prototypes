import React from 'react'

import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import BrowseAllActionsButton from '../BrowseAllActionsButton'

describe('<BrowseAllActionsButton />', () => {
    it('should render component', () => {
        renderWithRouter(<BrowseAllActionsButton />)

        expect(screen.getByText('Create from template')).toBeInTheDocument()
    })
})
