import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'

import TextInput from '../TextInput'

jest.mock('lodash/uniqueId', () => () => '42')

describe('<TextInput />', () => {
    const minProps: ComponentProps<typeof TextInput> = {
        className: 'class-for-wrapper',
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render an enabled input', () => {
        const {container} = render(<TextInput {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a disabled input', () => {
        const {container} = render(<TextInput {...minProps} isDisabled />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a required input', () => {
        const {container} = render(<TextInput {...minProps} isRequired />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with a custom className for the input', () => {
        const {container} = render(
            <TextInput {...minProps} inputClassName="custom-class-for-input" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an input with error state', () => {
        const {container} = render(<TextInput {...minProps} hasError />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call `onChange` when updating the input value', () => {
        const {container} = render(<TextInput {...minProps} />)

        fireEvent.change(container.querySelector('input') as Element, {
            target: {value: '1.00'},
        })
        expect(minProps.onChange).toHaveBeenCalledWith('1.00')
    })
})
