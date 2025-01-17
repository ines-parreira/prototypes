import {ExpressionFieldType} from '@gorgias/api-types'
import {UseQueryResult} from '@tanstack/react-query'
import {fireEvent, screen} from '@testing-library/react'
import React from 'react'

import {useCustomFieldDefinition} from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {CustomField} from 'custom-fields/types'
import {
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
    ticketDropdownFieldDefinition,
    ticketBooleanFieldDefinition,
} from 'fixtures/customField'
import {renderWithStoreAndQueryClientProvider} from 'tests/renderWithStoreAndQueryClientProvider'
import {assumeMock} from 'utils/testing'

import ThenField from '../ThenField'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')
const useCustomFieldDefinitionMock = assumeMock(useCustomFieldDefinition)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const customFields: Record<number, CustomField> = {
    1: {...ticketInputFieldDefinition, id: 1, label: 'Custom field #1'},
    2: {...ticketNumberFieldDefinition, id: 2, label: 'Custom field #2'},
    3: {...ticketDropdownFieldDefinition, id: 3, label: 'Custom field #3'},
    4: {...ticketBooleanFieldDefinition, id: 4, label: 'Custom field #4'},
}

useCustomFieldDefinitionMock.mockImplementation(
    (id) =>
        ({
            data: customFields[id],
            isLoading: false,
        }) as UseQueryResult<CustomField, unknown>
)
useCustomFieldDefinitionsMock.mockReturnValue({
    data: {data: Object.values(customFields)},
    isLoading: false,
} as any)

const defaultProps = {
    value: [
        {field_id: 1, type: ExpressionFieldType.Visible},
        {field_id: 2, type: ExpressionFieldType.Required},
        {field_id: 3, type: ExpressionFieldType.Visible},
    ],
    onChange: jest.fn(),
    ref: () => undefined,
}

describe('ThenField', () => {
    it('should render the empty component when no requirements are set', () => {
        renderWithStoreAndQueryClientProvider(
            <ThenField {...defaultProps} value={[]} />
        )

        expect(
            screen.getByText('No selected ticket fields')
        ).toBeInTheDocument()
    })

    it('should render the provided error message', () => {
        renderWithStoreAndQueryClientProvider(
            <ThenField {...defaultProps} error="Some error message" />
        )

        expect(screen.getByText('Some error message')).toBeInTheDocument()
    })

    it('should render as many rows as there are values', () => {
        renderWithStoreAndQueryClientProvider(<ThenField {...defaultProps} />)

        expect(screen.getAllByRole('row').length).toBe(
            defaultProps.value.length + 1 // +1 for the table header
        )

        for (const value of defaultProps.value) {
            expect(
                screen.getByText('Custom field #' + value.field_id)
            ).toBeInTheDocument()
        }
    })

    it('should not show the select button when all fields are set', () => {
        const allFields = [
            {field_id: 1, type: ExpressionFieldType.Visible},
            {field_id: 2, type: ExpressionFieldType.Required},
            {field_id: 3, type: ExpressionFieldType.Visible},
            {field_id: 4, type: ExpressionFieldType.Required},
        ]
        renderWithStoreAndQueryClientProvider(
            <ThenField {...defaultProps} value={allFields} />
        )

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(
            screen.getByText('All the possible custom fields have been set.')
        ).toBeInTheDocument()
    })

    it('should trigger onChange when adding a new field', () => {
        const onChange = jest.fn()
        renderWithStoreAndQueryClientProvider(
            <ThenField {...defaultProps} onChange={onChange} />
        )

        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByText('Custom field #4'))

        expect(onChange).toHaveBeenCalledWith([
            {field_id: 1, type: ExpressionFieldType.Visible},
            {field_id: 2, type: ExpressionFieldType.Required},
            {field_id: 3, type: ExpressionFieldType.Visible},
            {field_id: 4, type: ExpressionFieldType.Visible}, // New field added as "visible" by default
        ])
    })

    it('should trigger onChange when clicking the checkbox (visible to required)', () => {
        const onChange = jest.fn()
        renderWithStoreAndQueryClientProvider(
            <ThenField {...defaultProps} onChange={onChange} />
        )

        fireEvent.click(screen.getAllByLabelText('Required')[0]) // Check the first entry
        expect(onChange).toHaveBeenCalledWith([
            {field_id: 1, type: ExpressionFieldType.Required}, // Change from "visible" to "required"
            {field_id: 2, type: ExpressionFieldType.Required},
            {field_id: 3, type: ExpressionFieldType.Visible},
        ])
    })

    it('should trigger onChange when clicking the checkbox (required to visible)', () => {
        const onChange = jest.fn()
        renderWithStoreAndQueryClientProvider(
            <ThenField {...defaultProps} onChange={onChange} />
        )

        fireEvent.click(screen.getAllByLabelText('Required')[1]) // Check the second entry
        expect(onChange).toHaveBeenCalledWith([
            {field_id: 1, type: ExpressionFieldType.Visible},
            {field_id: 2, type: ExpressionFieldType.Visible}, // Change from "required" to "visible"
            {field_id: 3, type: ExpressionFieldType.Visible},
        ])
    })

    it('should trigger onChange without the clicked row when clicking the delete button', () => {
        const onChange = jest.fn()
        renderWithStoreAndQueryClientProvider(
            <ThenField {...defaultProps} onChange={onChange} />
        )

        fireEvent.click(screen.getAllByTitle('Remove field')[1]) // Delete the second field
        expect(onChange).toHaveBeenCalledWith([
            {field_id: 1, type: ExpressionFieldType.Visible},
            {field_id: 3, type: ExpressionFieldType.Visible},
        ])
    })
})
