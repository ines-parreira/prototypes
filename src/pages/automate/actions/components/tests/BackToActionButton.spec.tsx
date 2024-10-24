import {screen} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import BackToActionButton from '../BackToActionButton'

describe('<BackToActionButton />', () => {
    it('should render component', () => {
        renderWithRouter(<BackToActionButton />)

        expect(screen.getByText('Back to Actions')).toBeInTheDocument()
    })
})
