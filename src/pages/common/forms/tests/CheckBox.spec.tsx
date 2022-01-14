import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CheckBox from '../CheckBox'

describe('<CheckBox />', () => {
    const minProps = {
        isChecked: false,
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render an enabled CheckBox', () => {
        const {container} = render(<CheckBox {...minProps}>Shopify</CheckBox>)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a disabled CheckBox', () => {
        const {container} = render(
            <CheckBox {...minProps} isDisabled>
                Shopify
            </CheckBox>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render caption under the checkbox', () => {
        const {container} = render(
            <CheckBox {...minProps} caption="first e-commerce platform">
                Shopify
            </CheckBox>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call `onChange` when clicking on the input', () => {
        const {getByLabelText} = render(
            <CheckBox {...minProps}>Shopify</CheckBox>
        )

        userEvent.click(getByLabelText(/shopify/i))

        expect(minProps.onChange).toHaveBeenCalledWith(true)
    })

    it('should not call `onChange` when clicking on the disabled input', () => {
        const {getByLabelText} = render(
            <CheckBox {...minProps} isDisabled>
                Shopify
            </CheckBox>
        )

        userEvent.click(getByLabelText(/shopify/i))

        expect(minProps.onChange).not.toHaveBeenCalled()
    })
})
