import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import SortingDropdown from '../SortingDropdown'

jest.mock('hooks/useId', () => jest.fn(() => 'mocked'))

describe('<SortingDropdown />', () => {
    it('should display a dropdown', () => {
        const {getByText} = render(<SortingDropdown />)

        expect(getByText(/Oldest/)).toBeInTheDocument()
    })

    it('should update the selected value of the dropdown', () => {
        const {getByText} = render(<SortingDropdown />)

        fireEvent.click(getByText(/arrow_drop_down/i))
        fireEvent.click(getByText(/Newest/))

        expect(getByText(/Newest/)).toBeInTheDocument()
    })
})
