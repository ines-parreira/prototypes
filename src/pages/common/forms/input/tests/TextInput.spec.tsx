import React, { ComponentProps } from 'react'

import { fireEvent, render } from '@testing-library/react'

import TextInput from '../TextInput'

jest.mock('lodash/uniqueId', () => () => '42')

describe('<TextInput />', () => {
    const minProps: ComponentProps<typeof TextInput> = {
        className: 'class-for-wrapper',
        onChange: jest.fn(),
    }

    it('should render an enabled input', () => {
        const { container } = render(<TextInput {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a disabled input', () => {
        const { container } = render(<TextInput {...minProps} isDisabled />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a required input', () => {
        const { container } = render(<TextInput {...minProps} isRequired />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with a custom className for the input', () => {
        const { container } = render(
            <TextInput {...minProps} inputClassName="custom-class-for-input" />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an input with error state', () => {
        const { container } = render(<TextInput {...minProps} hasError />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call `onChange` when updating the input value', () => {
        const { container } = render(<TextInput {...minProps} />)

        fireEvent.change(container.querySelector('input') as Element, {
            target: { value: '1.00' },
        })
        expect(minProps.onChange).toHaveBeenCalledWith('1.00')
    })

    it('should render prefix and suffix', () => {
        const screen = render(
            <TextInput
                prefix={<span>Prefix</span>}
                suffix={<span>Suffix</span>}
            />,
        )

        expect(screen.getByText('Prefix')).toBeInTheDocument()
        expect(screen.getByText('Suffix')).toBeInTheDocument()
    })

    it('should be disabled when isDisabled is true', () => {
        const screen = render(<TextInput isDisabled />)

        const input = screen.getByRole('textbox')
        expect(input).toBeDisabled()
    })

    it('should clear text when clear icon is clicked', () => {
        const handleChange = jest.fn()
        const screen = render(
            <TextInput
                withClearText
                onChange={handleChange}
                value="Test value"
            />,
        )

        const clearButton = screen.getByRole('button')
        fireEvent.click(clearButton)

        expect(handleChange).toHaveBeenCalledWith('')
    })

    it('should focus input when prefix or suffix is clicked', () => {
        const screen = render(
            <TextInput
                prefix={<span>Prefix</span>}
                suffix={<span>Suffix</span>}
            />,
        )

        const input = screen.getByRole('textbox')
        const prefix = screen.getByText('Prefix')
        const suffix = screen.getByText('Suffix')

        fireEvent.click(prefix)
        expect(document.activeElement).toBe(input)

        fireEvent.click(suffix)
        expect(document.activeElement).toBe(input)
    })
})
