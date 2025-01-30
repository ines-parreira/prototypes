import {ExpressionFieldSource, ExpressionOperator} from '@gorgias/api-queries'
import {render, screen} from '@testing-library/react'
import React from 'react'

import {UseFormStateReturn, useFieldArray, useFormState} from 'core/forms'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {CustomField} from 'custom-fields/types'
import {assumeMock, getLastMockCall} from 'utils/testing'

import {AddButton} from '../AddButton'
import {ExpressionField} from '../ExpressionField'
import {ExpressionRow} from '../ExpressionRow'

jest.mock(
    'core/forms',
    () =>
        ({
            ...jest.requireActual('core/forms'),
            useFieldArray: jest.fn(),
            useFormState: jest.fn(),
            FormField: jest.fn(() => <div />),
        }) as Record<string, unknown>
)
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))
jest.mock('../AddButton', () => ({
    AddButton: jest.fn(() => <button>Add</button>),
}))
jest.mock('../ExpressionRow', () => ({
    ExpressionRow: jest.fn(() => <div />),
}))

const useFieldArrayMock = assumeMock(useFieldArray)
const useFormStateMock = assumeMock(useFormState)
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const AddButtonMock = assumeMock(AddButton)

describe('ExpressionField', () => {
    const definitions: CustomField[] = []
    const useFieldArrayReturnObject = {
        fields: [{id: 1}, {id: 2}],
        remove: jest.fn(),
        append: jest.fn(),
    } as unknown as ReturnType<typeof useFieldArray>

    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: definitions},
        } as ReturnType<typeof useCustomFieldDefinitions>)
        useFieldArrayMock.mockReturnValue(useFieldArrayReturnObject)
        useFormStateMock.mockReturnValue({errors: {}} as UseFormStateReturn<
            Record<string, unknown>
        >)
    })

    it('should call useFormState, useFieldArray and FormField with correct props', () => {
        render(<ExpressionField />)

        expect(useFormStateMock).toHaveBeenCalledWith({name: 'expression'})
        expect(useFieldArrayMock).toHaveBeenCalledWith({
            name: 'expression',
            rules: {required: expect.any(String)},
        })

        expect(ExpressionRow).toHaveBeenCalledTimes(2)
        expect(ExpressionRow).toHaveBeenNthCalledWith(
            1,
            {
                index: 0,
                customFieldDefinitions: definitions,
                onRemove: useFieldArrayReturnObject.remove,
            },
            {}
        )
        expect(ExpressionRow).toHaveBeenNthCalledWith(
            2,
            {
                index: 1,
                customFieldDefinitions: definitions,
                onRemove: useFieldArrayReturnObject.remove,
            },
            {}
        )
    })

    it('should render AddButton with correct props', () => {
        render(<ExpressionField />)

        expect(screen.getByText('Add')).toBeInTheDocument()
        getLastMockCall(AddButtonMock)[0].onClick()
        expect(useFieldArrayReturnObject.append).toHaveBeenCalledWith({
            field_source: ExpressionFieldSource.TicketCustomFields,
            field: 0,
            operator: ExpressionOperator.Is,
            values: [],
        })
    })

    it("should render error message if there's an error", () => {
        useFormStateMock.mockReturnValue({
            errors: {
                expression: {
                    root: {
                        message: 'Error message',
                    },
                },
            },
        } as unknown as UseFormStateReturn<Record<string, unknown>>)

        render(<ExpressionField />)

        expect(screen.getByText('Error message')).toBeInTheDocument()
    })
})
