import {render} from '@testing-library/react'
import React from 'react'
import {useController} from 'react-hook-form'

import InputField from 'pages/common/forms/input/InputField'
import {assumeMock, getLastMockCall} from 'utils/testing'

import {FormField} from '../components/FormField'

jest.mock('react-hook-form', () => ({
    useController: jest.fn(),
}))
jest.mock('pages/common/forms/input/InputField', () => jest.fn(() => null))

const useControllerMock = assumeMock(useController)
const InputFieldMock = assumeMock(InputField)

const defaultProps = {
    name: 'test',
    isDisabled: false,
}
const formFieldProps = {
    name: 'test result',
    onChange: jest.fn(),
    value: 'test',
}

describe('FormField', () => {
    beforeEach(() => {
        const errorMessage = 'error'
        useControllerMock.mockReturnValue({
            field: formFieldProps,
            fieldState: {error: {message: errorMessage}},
        } as unknown as ReturnType<typeof useController>)
    })

    it('should call useController with correct props', () => {
        const validation = {
            validate: 'should be a function',
        }
        render(
            <FormField {...defaultProps} isRequired validation={validation} />
        )

        expect(useControllerMock).toHaveBeenCalledWith({
            name: defaultProps.name,
            rules: {
                required: 'This field is required',
                ...validation,
            },
        })
    })

    it('should render InputField with correct props', () => {
        render(<FormField {...defaultProps} />)

        expect(InputField).toHaveBeenCalledWith(
            {
                ...defaultProps,
                ...formFieldProps,
                onChange: expect.any(Function),
                error: 'error',
            },
            {}
        )

        getLastMockCall(InputFieldMock)[0].onChange!('test')

        expect(formFieldProps.onChange).toHaveBeenCalledWith('test')
    })

    it('should render the custom field with correct props', () => {
        const CustomField = jest.fn(() => null)
        render(<FormField {...defaultProps} field={CustomField} />)

        expect(CustomField).toHaveBeenCalledWith(
            {
                ...defaultProps,
                ...formFieldProps,
                onChange: expect.any(Function),
                error: 'error',
            },
            {}
        )
    })

    it('should transform the input value', () => {
        const transform = jest.fn((value: string) => value.toUpperCase())
        render(<FormField {...defaultProps} inputTransform={transform} />)

        expect(getLastMockCall(InputFieldMock)[0].value).toEqual('TEST')
    })

    it('should transform the output value', () => {
        const transform = jest.fn((value: string) => value.toUpperCase())
        render(<FormField {...defaultProps} outputTransform={transform} />)
        getLastMockCall(InputFieldMock)[0].onChange!('test')

        expect(formFieldProps.onChange).toHaveBeenCalledWith('TEST')
    })
})
