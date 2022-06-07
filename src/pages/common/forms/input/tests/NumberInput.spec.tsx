import {render, fireEvent} from '@testing-library/react'
import React, {ComponentProps, useState} from 'react'

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

    it('should accept empty values', () => {
        const ControlledNumberInput = () => {
            const [value, setValue] = useState<number | undefined>(6)

            return (
                <NumberInput
                    onChange={setValue}
                    placeholder="foo"
                    value={value}
                />
            )
        }
        const {getByPlaceholderText} = render(<ControlledNumberInput />)
        const input = getByPlaceholderText(/foo/) as HTMLInputElement

        expect(input.value).toBe('6')
        fireEvent.change(input, {target: {value: ''}})
        expect(input.value).toBe('')
    })
})
