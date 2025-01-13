import {CustomFieldRequirementType} from '@gorgias/api-types'
import {fireEvent, screen} from '@testing-library/react'
import React from 'react'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {CustomField, CustomFieldObjectTypes} from 'custom-fields/types'
import {
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
    ticketDropdownFieldDefinition,
} from 'fixtures/customField'
import {renderWithStoreAndQueryClientProvider} from 'tests/renderWithStoreAndQueryClientProvider'
import {assumeMock} from 'utils/testing'

import CustomFieldSelectButton from '../CustomFieldSelectButton'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const customFields: CustomField[] = [
    {
        ...ticketInputFieldDefinition,
        id: 1,
        label: 'Custom field #1',
        requirement_type: CustomFieldRequirementType.Conditional,
    },
    {
        ...ticketNumberFieldDefinition,
        id: 2,
        label: 'Custom field #2',
        requirement_type: CustomFieldRequirementType.Required,
    },
    {
        ...ticketDropdownFieldDefinition,
        id: 3,
        label: 'Custom field #3',
        requirement_type: CustomFieldRequirementType.Visible,
    },
]

useCustomFieldDefinitionsMock.mockReturnValue({
    data: {data: customFields},
    isLoading: false,
} as any)

const defaultProps = {
    objectType: 'Ticket' as CustomFieldObjectTypes,
    ignoreIds: [],
    onSelect: jest.fn(),
}

describe('CustomFieldSelectButton', () => {
    it('should render only the button by default', () => {
        renderWithStoreAndQueryClientProvider(
            <CustomFieldSelectButton {...defaultProps} />
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.queryByText('Custom field #1')).not.toBeInTheDocument()
    })

    it('should list all fields on click', () => {
        renderWithStoreAndQueryClientProvider(
            <CustomFieldSelectButton {...defaultProps} />
        )

        fireEvent.click(screen.getByRole('combobox'))
        for (const customField of customFields) {
            expect(screen.getByText(customField.label)).toBeInTheDocument()
        }
    })

    it('should not show ignored fields', () => {
        renderWithStoreAndQueryClientProvider(
            <CustomFieldSelectButton {...defaultProps} ignoreIds={[1, 2]} />
        )

        fireEvent.click(screen.getByRole('combobox'))
        expect(screen.queryByText('Custom field #1')).not.toBeInTheDocument()
        expect(screen.queryByText('Custom field #2')).not.toBeInTheDocument()
        expect(screen.getByText('Custom field #3')).toBeInTheDocument()
    })

    it('should show an error when all fields are already selected', () => {
        renderWithStoreAndQueryClientProvider(
            <CustomFieldSelectButton {...defaultProps} ignoreIds={[1, 2, 3]} />
        )

        expect(
            screen.getByText('All the possible custom fields have been set.')
        ).toBeInTheDocument()
    })

    it('should trigger onChange when choosing a field', () => {
        const onSelect = jest.fn()
        renderWithStoreAndQueryClientProvider(
            <CustomFieldSelectButton {...defaultProps} onSelect={onSelect} />
        )

        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByText('Custom field #2'))

        expect(onSelect).toHaveBeenCalledWith(customFields[1].id)
    })
})
