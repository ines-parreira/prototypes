import React from 'react'

import { assumeMock, getLastMockCall } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { LegacySelectField as SelectField } from '@gorgias/axiom'

import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import type { CustomTypeDefinitionNumber } from 'custom-fields/types'
import {
    ticketBooleanFieldDefinition,
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'
import NumberInput from 'pages/common/forms/input/NumberInput'
import TextInput from 'pages/common/forms/input/TextInput'

import { CustomDropdownInput } from '../CustomDropdownInput'
import { ValueField } from '../ValueField'

jest.mock('custom-fields/components/MultiLevelSelect')
jest.mock(
    '@gorgias/axiom',
    () =>
        ({
            ...jest.requireActual('@gorgias/axiom'),
            LegacySelectField: jest.fn(() => <div data-testid="Mock" />),
        }) as Record<string, unknown>,
)
jest.mock('pages/common/forms/input/NumberInput', () => jest.fn(() => <div />))
jest.mock('pages/common/forms/input/TextInput', () => jest.fn(() => <div />))
jest.mock('../CustomDropdownInput')

const MultiLevelSelectMock = assumeMock(MultiLevelSelect)
const SelectFieldMock = assumeMock(SelectField)
const TextInputMock = assumeMock(TextInput)
const NumberInputMock = assumeMock(NumberInput)

describe('ValueField', () => {
    beforeEach(() => {
        MultiLevelSelectMock.mockImplementation(() => (
            <div>MultiLevelSelect</div>
        ))
    })

    const defaultProps = {
        index: 1,
        pickedDefinition: ticketDropdownFieldDefinition,
        value: ['value'],
        onChange: jest.fn(),
        isDisabled: true,
        error: 'meh',
    }

    it('should render an error', () => {
        render(<ValueField {...defaultProps} />)
        expect(screen.getByText('meh')).toBeInTheDocument()
    })

    it('should render a disabled select if there is no field picked yet', () => {
        render(<ValueField {...defaultProps} pickedDefinition={undefined} />)

        expect(SelectFieldMock).toHaveBeenCalledWith(
            {
                options: [],
                isDisabled: true,
                placeholder: 'Select field value(s)',
                onChange: expect.any(Function),
                selectedOption: null,
            },
            {},
        )
    })

    describe('Text input', () => {
        it('should render a text input if the field is a text input', () => {
            render(
                <ValueField
                    {...defaultProps}
                    pickedDefinition={ticketInputFieldDefinition}
                />,
            )

            expect(TextInputMock).toHaveBeenCalledWith(
                {
                    placeholder: 'Enter field value',
                    value: defaultProps.value[0],
                    onChange: expect.any(Function),
                    isDisabled: true,
                },
                {},
            )
        })

        it('should handle defaults and variations', () => {
            render(
                <ValueField
                    {...defaultProps}
                    pickedDefinition={ticketInputFieldDefinition}
                    isDisabled={false}
                    value={[]}
                />,
            )

            expect(TextInputMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: '',
                    isDisabled: false,
                }),
                {},
            )
        })

        it('should call passed onChange on change', () => {
            render(
                <ValueField
                    {...defaultProps}
                    pickedDefinition={ticketInputFieldDefinition}
                />,
            )

            getLastMockCall(TextInputMock)[0].onChange?.('new value')

            expect(defaultProps.onChange).toHaveBeenCalledWith(['new value'])
        })
    })

    describe('Number input', () => {
        it('should render a number input if the field is a number input', () => {
            render(
                <ValueField
                    {...defaultProps}
                    value={[1]}
                    pickedDefinition={ticketNumberFieldDefinition}
                />,
            )

            expect(NumberInput).toHaveBeenCalledWith(
                {
                    value: 1,
                    onChange: expect.any(Function),
                    min: Number(
                        ticketNumberFieldDefinition.definition.input_settings
                            .min,
                    ),
                    max: Number(
                        ticketNumberFieldDefinition.definition.input_settings
                            .max,
                    ),
                    isDisabled: true,
                },
                {},
            )
        })

        it('should handle defaults and variations', () => {
            const newTicketNumberFieldDefinition = {
                ...ticketNumberFieldDefinition,
                definition: {
                    ...ticketNumberFieldDefinition.definition,
                    input_settings: {
                        input_type: 'input_number',
                    },
                } as CustomTypeDefinitionNumber,
            }
            render(
                <ValueField
                    {...defaultProps}
                    pickedDefinition={newTicketNumberFieldDefinition}
                    isDisabled={false}
                    value={[]}
                />,
            )

            expect(NumberInput).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: undefined,
                    min: undefined,
                    max: undefined,
                    isDisabled: false,
                }),
                {},
            )
        })

        it('should correctly call passed onChange on change', () => {
            render(
                <ValueField
                    {...defaultProps}
                    pickedDefinition={ticketNumberFieldDefinition}
                />,
            )

            getLastMockCall(NumberInputMock)[0].onChange?.(5)
            expect(defaultProps.onChange).toHaveBeenCalledWith([5])

            getLastMockCall(NumberInputMock)[0].onChange?.()
            expect(defaultProps.onChange).toHaveBeenCalledWith(null)
        })
    })

    describe('Dropdown input', () => {
        describe('Yes / No dropdown', () => {
            it('should render a SelectField if the field is a boolean field', () => {
                render(
                    <ValueField
                        {...defaultProps}
                        value={[false]}
                        pickedDefinition={ticketBooleanFieldDefinition}
                    />,
                )

                expect(SelectFieldMock).toHaveBeenCalledWith(
                    {
                        options: ['Yes', 'No'],
                        onChange: expect.any(Function),
                        placeholder: 'Select field value',
                        isDisabled: true,
                        selectedOption: 'No',
                    },
                    {},
                )
            })

            it('should handle defaults and variations', () => {
                render(
                    <ValueField
                        {...defaultProps}
                        pickedDefinition={ticketBooleanFieldDefinition}
                        isDisabled={false}
                        value={[]}
                    />,
                )

                expect(SelectFieldMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        options: ['Yes', 'No'],
                        isDisabled: false,
                        selectedOption: null,
                    }),
                    {},
                )
            })

            it('should call passed onChange on change', () => {
                render(
                    <ValueField
                        {...defaultProps}
                        pickedDefinition={ticketBooleanFieldDefinition}
                    />,
                )

                getLastMockCall(SelectFieldMock)[0].onChange?.('Yes')
                expect(defaultProps.onChange).toHaveBeenCalledWith([true])

                getLastMockCall(SelectFieldMock)[0].onChange?.('No')
                expect(defaultProps.onChange).toHaveBeenCalledWith([false])
            })
        })

        describe('Non boolean dropdown', () => {
            it('should render a MultiLevelSelect if the field is not a boolean', () => {
                render(<ValueField {...defaultProps} />)

                expect(MultiLevelSelectMock).toHaveBeenCalledWith(
                    {
                        inputId: `expression-value-${defaultProps.pickedDefinition.id}-${defaultProps.index}`,
                        placeholder: 'Select field value(s)',
                        choices:
                            ticketDropdownFieldDefinition.definition
                                .input_settings.choices,
                        value: defaultProps.value,
                        onChange: expect.any(Function),
                        CustomInput: CustomDropdownInput,
                        customDisplayValue: expect.any(Function),
                        allowMultiValues: true,
                        dropdownAutoWidth: true,
                        isDisabled: true,
                    },
                    {},
                )
            })

            it('should handle defaults and variations', () => {
                render(
                    <ValueField
                        {...defaultProps}
                        isDisabled={false}
                        value={null}
                    />,
                )

                expect(MultiLevelSelectMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        value: [],
                        isDisabled: false,
                    }),
                    {},
                )
            })

            it('should call passed onChange on change', () => {
                render(<ValueField {...defaultProps} />)

                getLastMockCall(MultiLevelSelectMock)[0].onChange?.([
                    'new value',
                ])
                expect(defaultProps.onChange).toHaveBeenCalledWith([
                    'new value',
                ])
            })

            it('should provide a custom display value function returning correct values', () => {
                render(<ValueField {...defaultProps} />)

                expect(
                    getLastMockCall(
                        MultiLevelSelectMock,
                    )[0].customDisplayValue?.(['a', 'b']),
                ).toBe('a, b')

                expect(
                    getLastMockCall(
                        MultiLevelSelectMock,
                    )[0].customDisplayValue?.(['a', 'b', 'c', 'd']),
                ).toBe('4 fields selected')
            })
        })
    })
})
