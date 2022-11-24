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

    it('should increase value with proper step when clicking arrow', () => {
        const {getByText} = render(
            <NumberInput {...defaultProps} step={0.01} />
        )

        fireEvent.click(getByText('arrow_drop_up'))
        expect(defaultProps.onChange).toHaveBeenCalledWith(6.01)
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

    it('should initialize with rounded price', () => {
        const id = 'test-input'
        const screen = render(
            <NumberInput
                {...defaultProps}
                value={1.234567}
                step={0.01}
                data-testid={id}
            />
        )

        const input = screen.getByTestId(id) as HTMLInputElement
        expect(input.value).toBe('1.23')
    })

    it('should update with formatted price', () => {
        const id = 'test-input'
        const screen = render(
            <NumberInput
                {...defaultProps}
                value={13}
                step={0.01}
                data-testid={id}
            />
        )

        const input = screen.getByTestId(id) as HTMLInputElement
        fireEvent.blur(input)
        expect(input.value).toBe('13.00')
    })
})
