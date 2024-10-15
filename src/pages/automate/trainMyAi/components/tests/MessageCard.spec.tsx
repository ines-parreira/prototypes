import React from 'react'
import {screen, render} from '@testing-library/react'
import Header from '../Header'

describe('<Header />', () => {
    it('should render component', () => {
        render(<Header />)

        expect(
            screen.getByText(/how To train article recommendations/i)
        ).toBeInTheDocument()
    })
})
