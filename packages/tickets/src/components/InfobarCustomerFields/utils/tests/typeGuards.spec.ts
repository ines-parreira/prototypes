import {
    mockCustomField,
    mockDropdownInputSettingsSettings,
    mockNumberDataTypeDefinition,
    mockNumberInputSettings,
    mockTextDataTypeDefinition,
    mockTextInputSettings,
} from '@gorgias/helpdesk-mocks'
import {
    DropdownInputSettingsSettingsInputType,
    InputSettingsNumberInputType,
    InputSettingsTextInputType,
} from '@gorgias/helpdesk-types'

import { isDropdownInput, isNumberInput, isTextInput } from '../typeGuards'

const textInputField = mockCustomField({
    definition: mockTextDataTypeDefinition({
        input_settings: mockTextInputSettings({
            input_type: InputSettingsTextInputType.Input,
        }),
    }),
})

const numberInputField = mockCustomField({
    definition: mockNumberDataTypeDefinition({
        input_settings: mockNumberInputSettings({
            input_type: InputSettingsNumberInputType.InputNumber,
        }),
    }),
})

const dropdownInputField = mockCustomField({
    definition: mockTextDataTypeDefinition({
        input_settings: mockDropdownInputSettingsSettings({
            input_type: DropdownInputSettingsSettingsInputType.Dropdown,
        }),
    }),
})

// Invalid combination: Number data type with Dropdown input type
const unknownInputField = mockCustomField({
    definition: mockNumberDataTypeDefinition({
        input_settings: mockDropdownInputSettingsSettings({
            input_type: DropdownInputSettingsSettingsInputType.Dropdown,
        }) as any,
    }),
})

describe('custom fields type guards', () => {
    describe('isTextInput', () => {
        it.each([
            {
                fieldName: 'text input field',
                field: textInputField,
                expected: true,
            },
            {
                fieldName: 'number input field',
                field: numberInputField,
                expected: false,
            },
            {
                fieldName: 'dropdown field',
                field: dropdownInputField,
                expected: false,
            },
            {
                fieldName: 'unknown field',
                field: unknownInputField,
                expected: false,
            },
        ])('returns $expected for $fieldName', ({ field, expected }) => {
            expect(isTextInput(field)).toBe(expected)
        })
    })

    describe('isNumberInput', () => {
        it.each([
            {
                fieldName: 'text input field',
                field: textInputField,
                expected: false,
            },
            {
                fieldName: 'number input field',
                field: numberInputField,
                expected: true,
            },
            {
                fieldName: 'dropdown field',
                field: dropdownInputField,
                expected: false,
            },
            {
                fieldName: 'unknown field',
                field: unknownInputField,
                expected: false,
            },
        ])('returns $expected for $fieldName', ({ field, expected }) => {
            expect(isNumberInput(field)).toBe(expected)
        })
    })

    describe('isDropdownInput', () => {
        it.each([
            {
                fieldName: 'text input field',
                field: textInputField,
                expected: false,
            },
            {
                fieldName: 'number input field',
                field: numberInputField,
                expected: false,
            },
            {
                fieldName: 'dropdown field',
                field: dropdownInputField,
                expected: true,
            },
            {
                fieldName: 'unknown field',
                field: unknownInputField,
                expected: false,
            },
        ])('returns $expected for $fieldName', ({ field, expected }) => {
            expect(isDropdownInput(field)).toBe(expected)
        })
    })
})
