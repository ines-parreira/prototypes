import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import {SearchToggle} from '../SearchToggle'

describe('<SearchToggle />', () => {
    const mockedOnToggle = jest.fn()

    const props = {
        searchActivated: true,
        onToggle: mockedOnToggle,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the search toggle', () => {
        const {container} = render(<SearchToggle {...props} />)

        expect(container).toMatchSnapshot()
    })

    it('should display the toggle loading', () => {
        const {container} = render(<SearchToggle {...props} loading />)

        expect(container).toMatchSnapshot()
    })

    it('should trigger the onToggle callback when clicking on the checkbox', () => {
        const {getByRole} = render(<SearchToggle {...props} />)
        fireEvent.click(getByRole('checkbox'))
        expect(mockedOnToggle).toHaveBeenCalledWith(!props.searchActivated)
    })
})
