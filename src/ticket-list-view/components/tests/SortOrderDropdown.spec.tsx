import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import SortOrderDropdown from '../SortOrderDropdown'

jest.mock('hooks/useId', () => jest.fn(() => 'mocked'))

describe('<SortingDropdown />', () => {
    it('should display a dropdown', () => {
        const {getByText} = render(
            <SortOrderDropdown
                onChange={jest.fn()}
                value="created_datetime:asc"
            />
        )

        expect(getByText(/Oldest/)).toBeInTheDocument()
    })

    it('should update the selected value of the dropdown', () => {
        const onChange = jest.fn()
        const {getByText} = render(
            <SortOrderDropdown
                onChange={onChange}
                value="created_datetime:asc"
            />
        )

        fireEvent.click(getByText(/arrow_drop_down/i))
        fireEvent.click(getByText(/Newest/))

        expect(onChange).toHaveBeenCalledWith('created_datetime:desc')
    })
})
