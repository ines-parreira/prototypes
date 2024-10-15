import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithRouter} from 'utils/testing'
import BackToActionFormButton from '../BackToActionFormButton'

describe('<BackToActionFormButton />', () => {
    it('should render component', () => {
        renderWithRouter(<BackToActionFormButton />)

        expect(screen.getByText('Back to Action')).toBeInTheDocument()
    })
})
