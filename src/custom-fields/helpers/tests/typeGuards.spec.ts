import { CustomField } from 'custom-fields/types'

import { isDropdownInput, isNumberInput, isTextInput } from '../typeGuards'

const textInputField = {
    definition: {
        data_type: 'text',
        input_settings: {
            input_type: 'input',
        },
    },
} as CustomField

const numberInputField = {
    definition: {
        data_type: 'number',
        input_settings: {
            input_type: 'input_number',
        },
    },
} as CustomField

const dropdownInputField = {
    definition: {
        data_type: 'text',
        input_settings: {
            input_type: 'dropdown',
        },
    },
} as CustomField

const unknownInputField = {
    definition: {
        data_type: 'number',
        input_settings: {
            input_type: 'dropdown',
        },
    },
} as unknown as CustomField

describe('custom fields type guards', () => {
    describe('isTextInput', () => {
        it.each([
            [isTextInput, textInputField, true],
            [isTextInput, numberInputField, false],
            [isTextInput, dropdownInputField, false],
            [isTextInput, unknownInputField, false],
            [isNumberInput, textInputField, false],
            [isNumberInput, numberInputField, true],
            [isNumberInput, dropdownInputField, false],
            [isNumberInput, unknownInputField, false],
            [isDropdownInput, textInputField, false],
            [isDropdownInput, numberInputField, false],
            [isDropdownInput, dropdownInputField, true],
            [isDropdownInput, unknownInputField, false],
        ])("%p should return %p for '%p'", (fn, field, expected) => {
            expect(fn(field)).toBe(expected)
        })
    })
})
