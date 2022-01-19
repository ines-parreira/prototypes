import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import RadioButton from '../RadioButton'

describe('<RadioButton />', () => {
    const minProps = {
        label: 'sushis and sashimis',
        value: 'japanese',
        isChecked: false,
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render an enabled Radio field', () => {
        const {container} = render(<RadioButton {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a disabled RadioField', () => {
        const {container} = render(<RadioButton {...minProps} isDisabled />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render captions under radio button', () => {
        const {container} = render(
            <RadioButton {...minProps} caption="delicious" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call `onChange` when changing the value of the selected value', () => {
        const {getByText} = render(<RadioButton {...minProps} />)

        fireEvent.click(getByText(minProps.label))

        expect(minProps.onChange).toHaveBeenCalledWith(minProps.value)
    })

    it('should not call `onChange` when clicking on another value because the field is disabled', () => {
        const {getByText} = render(<RadioButton {...minProps} isDisabled />)

        fireEvent.click(getByText(minProps.label))

        expect(minProps.onChange).not.toHaveBeenCalled()
    })
})
