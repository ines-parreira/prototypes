import {render, fireEvent} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import NumberInput from '../NumberInput'

describe('<NumberInput />', () => {
    const defaultProps: ComponentProps<typeof NumberInput> = {
        onChange: jest.fn(),
        value: 6,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render a number input', () => {
        const {container} = render(<NumberInput {...defaultProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should increase value when clicking arrow', () => {
        const {getByText} = render(<NumberInput {...defaultProps} />)

        fireEvent.click(getByText('arrow_drop_up'))
        expect(defaultProps.onChange).toHaveBeenCalledWith(7)
    })

    it('should not increase value when input is disabled', () => {
        const {getByText} = render(<NumberInput {...defaultProps} isDisabled />)

        fireEvent.click(getByText('arrow_drop_up'))
        expect(defaultProps.onChange).not.toHaveBeenCalled()
    })
})
