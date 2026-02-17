import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import {
    mockBooleanDataTypeDefinition,
    mockBooleanDropdownInputSettings,
    mockCustomField,
    mockDropdownInputSettingsSettings,
    mockNumberDataTypeDefinition,
    mockNumberInputSettings,
    mockTextDataTypeDefinition,
    mockTextInputSettings,
} from '@gorgias/helpdesk-mocks'
import type { NumberInputSettings } from '@gorgias/helpdesk-types'
import {
    DropdownInputSettingsSettingsInputType,
    InputSettingsNumberInputType,
    InputSettingsTextInputType,
    ObjectType,
} from '@gorgias/helpdesk-types'

import { render } from '../../../../tests/render.utils'
import { CustomCustomerFieldInput } from '../CustomCustomerFieldInput'

const textField = mockCustomField({
    id: 1,
    label: 'Company',
    object_type: ObjectType.Customer,
    definition: mockTextDataTypeDefinition({
        input_settings: mockTextInputSettings({
            input_type: InputSettingsTextInputType.Input,
            placeholder: 'Enter company name',
        }),
    }),
})

const textFieldWithoutPlaceholder = mockCustomField({
    id: 2,
    label: 'Notes',
    object_type: ObjectType.Customer,
    definition: mockTextDataTypeDefinition({
        input_settings: mockTextInputSettings({
            input_type: InputSettingsTextInputType.Input,
            placeholder: undefined,
        }),
    }),
})

const numberField = mockCustomField({
    id: 3,
    label: 'Age',
    object_type: ObjectType.Customer,
    definition: mockNumberDataTypeDefinition({
        input_settings: mockNumberInputSettings({
            input_type: InputSettingsNumberInputType.InputNumber,
            min: 0,
            max: 1000000000,
            placeholder: 'Enter age',
        }),
    }),
})

const numberFieldWithoutPlaceholder = mockCustomField({
    id: 4,
    label: 'Score',
    object_type: ObjectType.Customer,
    definition: mockNumberDataTypeDefinition({
        input_settings: mockNumberInputSettings({
            input_type: InputSettingsNumberInputType.InputNumber,
            placeholder: undefined,
        }),
    }),
})

const dropdownField = mockCustomField({
    id: 5,
    label: 'Status',
    object_type: ObjectType.Customer,
    definition: mockTextDataTypeDefinition({
        input_settings: mockDropdownInputSettingsSettings({
            input_type: DropdownInputSettingsSettingsInputType.Dropdown,
            choices: ['active', 'inactive', 'pending'],
        }),
    }),
})

const booleanDropdownField = mockCustomField({
    id: 6,
    label: 'Active',
    object_type: ObjectType.Customer,
    definition: mockBooleanDataTypeDefinition({
        input_settings: mockBooleanDropdownInputSettings({
            input_type: DropdownInputSettingsSettingsInputType.Dropdown,
            choices: [true, false],
        }),
    }),
})

describe('CustomCustomerFieldInput', () => {
    describe('text input', () => {
        it('should render text field with custom placeholder', async () => {
            render(
                <CustomCustomerFieldInput
                    field={textField}
                    onChange={vi.fn()}
                />,
            )

            expect(
                await screen.findByPlaceholderText('Enter company name'),
            ).toBeInTheDocument()
        })

        it('should render text field with default placeholder when none provided', async () => {
            render(
                <CustomCustomerFieldInput
                    field={textFieldWithoutPlaceholder}
                    onChange={vi.fn()}
                />,
            )

            expect(
                await screen.findByPlaceholderText('+ Add'),
            ).toBeInTheDocument()
        })

        it('should render text field with value', async () => {
            render(
                <CustomCustomerFieldInput
                    field={textField}
                    value="Acme Corp"
                    onChange={vi.fn()}
                />,
            )

            expect(
                await screen.findByDisplayValue('Acme Corp'),
            ).toBeInTheDocument()
        })

        it('should call onChange when text value changes', async () => {
            const onChange = vi.fn()

            render(
                <CustomCustomerFieldInput
                    field={textField}
                    onChange={onChange}
                />,
            )

            const input =
                await screen.findByPlaceholderText('Enter company name')
            await act(async () => {
                await userEvent.type(input, 'New Company')
                input.blur()
            })

            expect(onChange).toHaveBeenCalled()
            expect(onChange.mock.calls.length).toBeGreaterThan(0)
        })
    })

    describe('number input', () => {
        it('should render number field with custom placeholder', async () => {
            render(
                <CustomCustomerFieldInput
                    field={numberField}
                    onChange={vi.fn()}
                />,
            )

            expect(
                await screen.findByPlaceholderText('Enter age'),
            ).toBeInTheDocument()
        })

        it('should render number field with default placeholder', async () => {
            render(
                <CustomCustomerFieldInput
                    field={numberFieldWithoutPlaceholder}
                    onChange={vi.fn()}
                />,
            )

            expect(
                await screen.findByPlaceholderText('+ Add'),
            ).toBeInTheDocument()
        })

        it('should render number field value without grouping separators', async () => {
            render(
                <CustomCustomerFieldInput
                    field={numberField}
                    value={100000123}
                    onChange={vi.fn()}
                />,
            )

            expect(
                await screen.findByDisplayValue('100000123'),
            ).toBeInTheDocument()
            expect(
                screen.queryByDisplayValue('100,000,123'),
            ).not.toBeInTheDocument()
        })

        it('should handle string value by converting to number', async () => {
            render(
                <CustomCustomerFieldInput
                    field={numberField}
                    value={'30' as unknown as number}
                    onChange={vi.fn()}
                />,
            )

            expect(await screen.findByDisplayValue('30')).toBeInTheDocument()
        })

        it('should accept number input', async () => {
            const onChange = vi.fn()

            render(
                <CustomCustomerFieldInput
                    field={numberField}
                    value={0}
                    onChange={onChange}
                />,
            )

            const incrementButton = await screen.findByRole('button', {
                name: 'Increase Age',
            })
            await act(async () => {
                await userEvent.click(incrementButton)
            })

            // TextInput is not firing onChange onBlur, to be checked in Axiom
            expect(onChange).toHaveBeenCalled()
            expect(onChange.mock.calls.length).toBeGreaterThan(0)
        })
    })

    describe('dropdown input', () => {
        it('should render dropdown with placeholder', async () => {
            render(
                <CustomCustomerFieldInput
                    field={dropdownField}
                    onChange={vi.fn()}
                />,
            )

            expect(
                await screen.findByPlaceholderText('+ Add'),
            ).toBeInTheDocument()
        })

        it('should render dropdown with selected value', async () => {
            render(
                <CustomCustomerFieldInput
                    field={dropdownField}
                    value="active"
                    onChange={vi.fn()}
                />,
            )

            const inputs = await screen.findAllByDisplayValue('active')
            expect(inputs.length).toBeGreaterThan(0)
            expect(inputs[0]).toBeInTheDocument()
        })

        it('should open dropdown and show options', async () => {
            render(
                <CustomCustomerFieldInput
                    field={dropdownField}
                    onChange={vi.fn()}
                />,
            )

            const input = await screen.findByPlaceholderText('+ Add')
            await act(() => userEvent.click(input))

            const options = await screen.findAllByText('inactive')
            expect(options.length).toBeGreaterThan(0)
        })

        it('should handle boolean dropdown choices', async () => {
            render(
                <CustomCustomerFieldInput
                    field={booleanDropdownField}
                    value={true}
                    onChange={vi.fn()}
                />,
            )

            const inputs = await screen.findAllByDisplayValue('Yes')
            expect(inputs.length).toBeGreaterThan(0)
            expect(inputs[0]).toBeInTheDocument()
        })

        it('should handle dropdown field with empty choices', async () => {
            const emptyDropdownField = mockCustomField({
                id: 8,
                label: 'Empty',
                object_type: ObjectType.Customer,
                definition: mockTextDataTypeDefinition({
                    input_settings: mockDropdownInputSettingsSettings({
                        input_type:
                            DropdownInputSettingsSettingsInputType.Dropdown,
                        choices: [],
                    }),
                }),
            })

            render(
                <CustomCustomerFieldInput
                    field={emptyDropdownField}
                    onChange={vi.fn()}
                />,
            )

            expect(
                await screen.findByPlaceholderText('+ Add'),
            ).toBeInTheDocument()
        })
    })

    describe('unsupported field type', () => {
        it('should return null for unsupported field type', () => {
            const unsupportedField = mockCustomField({
                id: 9,
                label: 'Unsupported',
                object_type: ObjectType.Customer,
                definition: mockNumberDataTypeDefinition({
                    input_settings: mockTextInputSettings(
                        {},
                    ) as unknown as NumberInputSettings,
                }),
            })

            const { container } = render(
                <CustomCustomerFieldInput
                    field={unsupportedField}
                    onChange={vi.fn()}
                />,
            )

            expect(container.firstChild).toBeNull()
        })
    })
})
