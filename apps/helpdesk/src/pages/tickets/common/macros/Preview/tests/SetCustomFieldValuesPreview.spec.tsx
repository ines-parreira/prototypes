import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { ticketInputFieldDefinition as mockTicketInputFieldDefinition } from 'fixtures/customField'
import { setCustomFieldValueAction as mockSetCustomFieldValueAction } from 'fixtures/macro'

import { SetCustomFieldValuesPreview } from '../SetCustomFieldValuesPreview'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')

const mockedUseCustomFieldDefinition = assumeMock(useCustomFieldDefinition)

describe('<SetCustomFieldValuesPreview />', () => {
    beforeEach(() => {
        mockedUseCustomFieldDefinition.mockReturnValue({
            data: mockTicketInputFieldDefinition,
            isLoading: false,
        } as any)
    })

    it('should render custom field values preview', () => {
        render(
            <SetCustomFieldValuesPreview
                actions={[mockSetCustomFieldValueAction]}
            />,
        )

        expect(screen.getByText(/Field/)).toBeInTheDocument()
        expect(screen.getByText(/Input field/)).toBeInTheDocument()
        expect(screen.getByText('Custom field value')).toBeInTheDocument()
    })

    it('should render multiple custom field values', () => {
        const actions = [
            mockSetCustomFieldValueAction,
            {
                ...mockSetCustomFieldValueAction,
                arguments: {
                    ...mockSetCustomFieldValueAction.arguments,
                    custom_field_id: 2,
                },
            },
        ]

        render(<SetCustomFieldValuesPreview actions={actions} />)

        expect(screen.getAllByText(/Input field/i)).toHaveLength(2)
        expect(screen.getAllByText(/Custom field value/)).toHaveLength(2)
    })

    it('should return null when no actions are provided', () => {
        const { container } = render(
            <SetCustomFieldValuesPreview actions={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null when no actions have SetCustomFieldValue type', () => {
        const otherActions = [
            {
                name: 'SetStatus',
                arguments: { status: 'open' },
                title: 'SetStatus',
            },
            {
                name: 'AddTags',
                arguments: { tags: 'urgent' },
                title: 'AddTags',
            },
        ]

        const { container } = render(
            <SetCustomFieldValuesPreview actions={otherActions} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle archived custom fields', () => {
        const archivedField = {
            ...mockTicketInputFieldDefinition,
            deactivated_datetime: '2023-01-01T00:00:00Z',
        }

        mockedUseCustomFieldDefinition.mockReturnValue({
            data: archivedField,
            isLoading: false,
        } as any)

        render(
            <SetCustomFieldValuesPreview
                actions={[mockSetCustomFieldValueAction]}
            />,
        )

        expect(screen.getByText('Archived')).toBeInTheDocument()
        expect(screen.getByText(/Field/)).toBeInTheDocument()
    })

    it('should still render the component even if individual fields are loading', () => {
        mockedUseCustomFieldDefinition.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        render(
            <SetCustomFieldValuesPreview
                actions={[mockSetCustomFieldValueAction]}
            />,
        )

        expect(screen.getByText(/Field/i)).toBeInTheDocument()
    })
})
