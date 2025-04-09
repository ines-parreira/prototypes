import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { RequirementType } from '@gorgias/api-queries'

import { CustomField } from 'custom-fields/types'

import {
    StoreCustomFieldComponent,
    StoreCustomFieldsList,
} from '../StoreCustomFieldList'

describe('StoreCustomFieldComponent', () => {
    const mockOnDelete = jest.fn()
    const sampleField = {
        id: 1,
        label: 'Test Field',
        requirement_type: RequirementType.Required,
    } as CustomField

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders the component with the correct label', () => {
        render(
            <StoreCustomFieldComponent
                customField={sampleField}
                onDelete={mockOnDelete}
            />,
        )
        const input = screen.getByLabelText(
            'custom-field-disabled-input',
        ) as HTMLInputElement
        expect(input).toBeInTheDocument()
        expect(input.value).toBe('Test Field')
    })

    test('calls onDelete when the delete button is clicked', () => {
        render(
            <StoreCustomFieldComponent
                customField={sampleField}
                onDelete={mockOnDelete}
            />,
        )
        const deleteButton = screen.getByLabelText(
            'custom-field-disabled-input-delete-button',
        )
        fireEvent.click(deleteButton)
        expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })
})

describe('StoreCustomFieldsList', () => {
    const mockOnDelete = jest.fn()

    const customField1 = {
        id: 1,
        label: 'Field One',
        requirement_type: RequirementType.Visible,
    } as CustomField

    const customField2 = {
        id: 2,
        label: 'Field Two',
        requirement_type: RequirementType.Conditional,
    } as CustomField

    // Create a map for lookup
    const accountCustomFieldMap = new Map<number, CustomField>([
        [1, customField1],
        [2, customField2],
    ])

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders only non-conditional fields', () => {
        render(
            <StoreCustomFieldsList
                customFieldIds={[1, 2]}
                accountCustomFieldMap={accountCustomFieldMap}
                onDelete={mockOnDelete}
            />,
        )
        expect(screen.getByDisplayValue('Field One')).toBeInTheDocument()
        expect(screen.queryByDisplayValue('Field Two')).toBeNull()
    })

    test('calls onDelete with correct id when delete button is clicked', () => {
        render(
            <StoreCustomFieldsList
                customFieldIds={[1]}
                accountCustomFieldMap={accountCustomFieldMap}
                onDelete={mockOnDelete}
            />,
        )
        const deleteButton = screen.getByLabelText(
            'custom-field-disabled-input-delete-button',
        )
        fireEvent.click(deleteButton)
        expect(mockOnDelete).toHaveBeenCalledWith(1)
    })
})
