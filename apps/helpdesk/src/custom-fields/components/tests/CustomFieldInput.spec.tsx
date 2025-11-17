import React from 'react'

import { assumeMock, getLastMockCall } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import StealthInput from 'custom-fields/components/StealthInput'
import type { CustomField, CustomFieldPrediction } from 'custom-fields/types'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'

import CustomFieldInput from '../CustomFieldInput'

jest.mock('custom-fields/components/StealthInput', () => {
    return jest.fn(() => <div>stealth input</div>)
})
jest.mock('custom-fields/components/MultiLevelSelect', () => {
    return jest.fn(() => <div>multiselect</div>)
})

const mockedStealthInput = assumeMock(StealthInput)

describe('CustomFieldInput', () => {
    const defaultProps = {
        id: 'test',
        value: 'value',
        hasError: false,
        isDisabled: false,
        onChange: jest.fn((value: unknown) => value),
        onFocus: jest.fn(),
        onBlur: jest.fn(),
        placeholder: 'placeholder',
    }

    describe('Text input field type', () => {
        it('should render a stealth input when definition matches text input', () => {
            render(
                <CustomFieldInput
                    {...defaultProps}
                    field={ticketInputFieldDefinition}
                />,
            )

            expect(screen.getByText('stealth input')).toBeInTheDocument()
            expect(StealthInput).toHaveBeenCalledWith(
                {
                    ...defaultProps,
                    type: 'text',
                    name: ticketInputFieldDefinition.label,
                    placeholder:
                        ticketInputFieldDefinition.definition.input_settings
                            .placeholder,
                },
                expect.any(Object),
            )
        })

        it("should pass hasError and isDisabled props to StealthInput component when they're provided", () => {
            render(
                <CustomFieldInput
                    {...defaultProps}
                    field={ticketInputFieldDefinition}
                    hasError={true}
                    isDisabled={true}
                />,
            )

            expect(StealthInput).toHaveBeenCalledWith(
                expect.objectContaining({
                    hasError: true,
                    isDisabled: true,
                }),
                expect.any(Object),
            )
        })

        it('should accept a provided placeholder if definition does not contain some', () => {
            render(
                <CustomFieldInput
                    {...defaultProps}
                    field={{
                        ...ticketInputFieldDefinition,
                        definition: {
                            ...ticketInputFieldDefinition.definition,
                            input_settings: {
                                ...ticketInputFieldDefinition.definition
                                    .input_settings,
                                placeholder: undefined,
                            },
                        },
                    }}
                />,
            )

            expect(StealthInput).toHaveBeenCalledWith(
                expect.objectContaining({
                    placeholder: 'placeholder',
                }),
                expect.any(Object),
            )
        })
    })

    describe('Number input field type', () => {
        it('should render a stealth input when definition matches number input', () => {
            render(
                <CustomFieldInput
                    {...defaultProps}
                    field={ticketNumberFieldDefinition}
                    value={3}
                />,
            )

            expect(screen.getByText('stealth input')).toBeInTheDocument()
            expect(StealthInput).toHaveBeenCalledWith(
                {
                    ...defaultProps,
                    value: 3,
                    type: 'number',
                    name: ticketNumberFieldDefinition.label,
                    min: ticketNumberFieldDefinition.definition.input_settings
                        .min,
                    max: ticketNumberFieldDefinition.definition.input_settings
                        .max,
                    onChange: expect.any(Function),
                },
                expect.any(Object),
            )
        })

        it('should cast input and output value into a number', () => {
            render(
                <CustomFieldInput
                    {...defaultProps}
                    field={ticketNumberFieldDefinition}
                    value="3"
                />,
            )

            expect(StealthInput).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: 3,
                }),
                expect.any(Object),
            )
            expect(getLastMockCall(mockedStealthInput)[0].onChange!('4')).toBe(
                4,
            )
            expect(
                getLastMockCall(mockedStealthInput)[0].onChange!('meh'),
            ).toBe(NaN)
        })
    })

    describe('Dropdown input field type', () => {
        it('should render a multilevel select when definition matches dropdown input', () => {
            const prediction = {} as CustomFieldPrediction
            render(
                <CustomFieldInput
                    {...defaultProps}
                    field={ticketDropdownFieldDefinition}
                    dropdownAdditionalProps={{ prediction }}
                />,
            )

            expect(screen.getByText('multiselect')).toBeInTheDocument()
            expect(MultiLevelSelect).toHaveBeenCalledWith(
                {
                    ...defaultProps,
                    inputId: defaultProps.id,
                    label: ticketDropdownFieldDefinition.label,
                    id: ticketDropdownFieldDefinition.id,
                    choices:
                        ticketDropdownFieldDefinition.definition.input_settings
                            .choices,
                    prediction,
                    onBlur: undefined,
                    allowMultiValues: undefined,
                    customDisplayValue: undefined,
                },
                expect.any(Object),
            )
        })

        it('should pass specific props to MultiLevelSelect component', () => {
            const mockPrediction = { predicted: 'foo' } as CustomFieldPrediction
            render(
                <CustomFieldInput
                    {...defaultProps}
                    field={ticketDropdownFieldDefinition}
                    value={['value1', 'value2']}
                    dropdownAdditionalProps={{
                        allowMultiValues: true,
                        prediction: mockPrediction,
                        customDisplayValue: jest.fn(),
                    }}
                />,
            )

            expect(MultiLevelSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: ['value1', 'value2'],
                    allowMultiValues: true,
                    prediction: mockPrediction,
                    customDisplayValue: expect.any(Function),
                }),
                expect.any(Object),
            )
        })
    })

    describe('Unknown input field type', () => {
        it('should should handle unknown type', () => {
            render(
                <CustomFieldInput
                    {...defaultProps}
                    field={
                        {
                            definition: {
                                data_type: 'number',
                                input_settings: {
                                    input_type: 'dropdown',
                                },
                            },
                        } as unknown as CustomField
                    }
                />,
            )

            expect(screen.getByText('Coming soon')).toBeInTheDocument()
        })
    })
})
