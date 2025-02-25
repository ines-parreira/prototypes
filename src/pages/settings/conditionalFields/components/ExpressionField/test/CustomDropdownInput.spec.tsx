import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { CustomDropdownInput } from '../CustomDropdownInput'

describe('CustomDropdownInput', () => {
    const onFocus = jest.fn()
    const defaultProps = {
        id: '1',
        value: 'value',
        placeholder: 'placeholder',
        isDisabled: true,
        isOpen: false,
        onFocus,
    }

    it('should render the input with the correct settings', () => {
        render(<CustomDropdownInput {...defaultProps} />)
        const input = screen.getByRole('textbox')

        expect(input).toHaveAttribute('id', '1')
        expect(input).toHaveAttribute('value', 'value')
        expect(input).toHaveAttribute('placeholder', 'placeholder')
        expect(input).toBeDisabled()

        fireEvent.focus(input)

        expect(onFocus).toHaveBeenCalled()
    })

    it("should render the dropdown arrow as 'arrow_drop_down' when isOpen is false", () => {
        render(<CustomDropdownInput {...defaultProps} />)
        expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
    })

    it("should render the dropdown arrow as 'arrow_drop_up' when isOpen is true", () => {
        render(<CustomDropdownInput {...defaultProps} isOpen={true} />)
        expect(screen.getByText('arrow_drop_up')).toBeInTheDocument()
    })
})
