import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import DropdownHeader from '../DropdownHeader'

describe('<DropdownHeader />', () => {
    it('should render', () => {
        const {container} = render(
            <DropdownHeader
                prefix={<i className="material-icons">arrow_back</i>}
            >
                Back
            </DropdownHeader>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should trigger click when pressing Enter or Space key', () => {
        const mockOnClick = jest.fn()
        const {getByText} = render(
            <DropdownHeader onClick={mockOnClick}>Back</DropdownHeader>
        )
        const inputElement = getByText('Back')?.parentElement

        if (inputElement) {
            fireEvent.keyDown(inputElement, {key: 'Enter'})
            fireEvent.keyDown(inputElement, {key: ' '})
        }

        expect(mockOnClick).toHaveBeenCalledTimes(2)
    })
})
