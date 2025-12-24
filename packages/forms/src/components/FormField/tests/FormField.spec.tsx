import React from 'react'

import { assumeMock, getLastMockCall } from '@repo/testing/vitest'
import { render } from '@testing-library/react'
import { useController } from 'react-hook-form'
import { vi } from 'vitest'

import { FormField } from '../FormField'

vi.mock('react-hook-form', () => ({
    useController: vi.fn(),
}))

const useControllerMock = assumeMock(useController)

const MockField = vi.fn(() => null)

const defaultProps = {
    name: 'test',
    isDisabled: false,
    field: MockField,
}
const formFieldProps = {
    name: 'test result',
    onChange: vi.fn(),
    value: 'test',
}

describe('FormField', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        const errorMessage = 'error'
        useControllerMock.mockReturnValue({
            field: formFieldProps,
            fieldState: { error: { message: errorMessage } },
        } as unknown as ReturnType<typeof useController>)
    })

    it('should call useController with correct props', () => {
        const validation = {
            validate: 'should be a function',
        }
        render(
            <FormField {...defaultProps} isRequired validation={validation} />,
        )

        expect(useControllerMock).toHaveBeenCalledWith({
            name: defaultProps.name,
            rules: {
                required: 'This field is required',
                ...validation,
            },
        })
    })

    it('should render field with correct props', () => {
        render(<FormField {...defaultProps} />)

        expect(MockField).toHaveBeenCalledWith(
            {
                ...formFieldProps,
                onChange: expect.any(Function),
                error: 'error',
                isDisabled: false,
            },
            {},
        )

        getLastMockCall(MockField)[0].onChange!('test')
        expect(formFieldProps.onChange).toHaveBeenCalledWith('test')
    })

    it('should render the custom field with correct props', () => {
        const CustomField = vi.fn(() => null)
        render(<FormField {...defaultProps} field={CustomField} />)

        expect(CustomField).toHaveBeenCalledWith(
            {
                ...formFieldProps,
                onChange: expect.any(Function),
                error: 'error',
                isDisabled: false,
            },
            {},
        )
    })

    it('should transform the input value', () => {
        const transform = vi.fn((value: string) => value.toUpperCase())
        render(<FormField {...defaultProps} inputTransform={transform} />)

        expect(getLastMockCall(MockField)[0]?.value).toEqual('TEST')
    })

    it('should transform the output value', () => {
        const transform = vi.fn((value: string) => value.toUpperCase()) as any
        render(<FormField {...defaultProps} outputTransform={transform} />)
        ;(getLastMockCall(MockField)[0].onChange as any)('test')

        expect(formFieldProps.onChange).toHaveBeenCalledWith('TEST')
    })
})
