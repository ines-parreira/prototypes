import { render, screen } from '@testing-library/react'

import { MacroAction, MacroActionType } from '@gorgias/helpdesk-types'

import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { ticketInputFieldDefinition as mockTicketInputFieldDefinition } from 'fixtures/customField'
import { MacroActionName } from 'models/macroAction/types'

import { SetCustomerCustomFieldValuesPreview } from '../SetCustomerCustomFieldValuesPreview'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')

const mockedUseCustomFieldDefinition = jest.mocked(useCustomFieldDefinition)

describe('SetCustomerCustomFieldValuesPreview', () => {
    const createSetCustomerCustomFieldValueAction = (
        value: string | number | boolean,
        customerFieldId = 1,
    ): MacroAction => ({
        name: MacroActionName.SetCustomerCustomFieldValue,
        type: MacroActionType.User,
        title: 'Set customer field',
        arguments: {
            customer_field_id: customerFieldId,
            value,
        },
    })

    beforeEach(() => {
        mockedUseCustomFieldDefinition.mockReturnValue({
            data: mockTicketInputFieldDefinition,
            isLoading: false,
        } as any)
    })

    it('should render nothing when no actions are provided', () => {
        const { container } = render(<SetCustomerCustomFieldValuesPreview />)
        expect(container.firstChild).toBeNull()
    })

    it('should render SetCustomerCustomFieldValue actions', () => {
        const actions = [
            createSetCustomerCustomFieldValueAction('Premium Customer', 1),
            createSetCustomerCustomFieldValueAction('VIP', 2),
            createSetCustomerCustomFieldValueAction('Active', 3),
        ]

        render(<SetCustomerCustomFieldValuesPreview actions={actions} />)

        expect(screen.getAllByText(/Input field/i)).toHaveLength(3)
        expect(screen.getByText('Premium Customer')).toBeInTheDocument()
        expect(screen.getByText('VIP')).toBeInTheDocument()
        expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should handle different value types', () => {
        render(
            <SetCustomerCustomFieldValuesPreview
                actions={[
                    createSetCustomerCustomFieldValueAction('String value'),
                    createSetCustomerCustomFieldValueAction(123),
                    createSetCustomerCustomFieldValueAction(true),
                ]}
            />,
        )

        expect(screen.getByText('String value')).toBeInTheDocument()
        expect(screen.getByText('123')).toBeInTheDocument()
        expect(screen.getByText('true')).toBeInTheDocument()
    })

    it('should handle actions with missing value argument', () => {
        render(
            <SetCustomerCustomFieldValuesPreview
                actions={[
                    {
                        name: MacroActionName.SetCustomerCustomFieldValue,
                        type: MacroActionType.User,
                        title: 'Set customer field',
                        arguments: {
                            customer_field_id: 1,
                            // no value property
                        },
                    },
                ]}
            />,
        )

        expect(screen.getByText(/Input field/i)).toBeInTheDocument()
    })

    it('should handle actions with missing arguments', () => {
        render(
            <SetCustomerCustomFieldValuesPreview
                actions={[
                    {
                        name: MacroActionName.SetCustomerCustomFieldValue,
                        type: MacroActionType.User,
                        title: 'Set customer field',
                        arguments: {},
                    },
                ]}
            />,
        )

        expect(screen.getByText(/Input field/i)).toBeInTheDocument()
    })

    it('should ignore non customer custom field actions', () => {
        const actions: MacroAction[] = [
            createSetCustomerCustomFieldValueAction('VIP'),
            {
                name: MacroActionName.SetCustomFieldValue,
                type: MacroActionType.User,
                title: 'Set account field',
                arguments: {
                    custom_field_id: 99,
                    value: 'Account',
                },
            },
        ]

        render(<SetCustomerCustomFieldValuesPreview actions={actions} />)

        expect(screen.getAllByText(/Input field/i)).toHaveLength(1)
        expect(screen.queryByText('Account')).not.toBeInTheDocument()
    })
})
