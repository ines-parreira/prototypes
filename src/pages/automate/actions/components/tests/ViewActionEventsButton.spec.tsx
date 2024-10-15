import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithRouter} from 'utils/testing'
import ViewActionEventsButton from '../ViewActionEventsButton'

describe('<DeleteActionConfirmation />', () => {
    it('should render component', () => {
        renderWithRouter(<ViewActionEventsButton />)

        expect(screen.getByText('View Events')).toBeInTheDocument()
    })
})
