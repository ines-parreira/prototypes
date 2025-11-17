import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type {
    CustomField,
    ManagedCustomerFieldType,
} from '@gorgias/helpdesk-types'
import { ManagedTicketFieldType } from '@gorgias/helpdesk-types'

import { isFieldRequired } from 'custom-fields/helpers/isFieldRequired'
import {
    callStatusManagedTicketInputFieldDefinition,
    ticketDropdownFieldDefinition,
    ticketFieldDefinitions,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import TicketField from '../TicketField'

const mockStore = configureMockStore()

function getValueForDataType(dataType: CustomField['definition']['data_type']) {
    switch (dataType) {
        case 'text':
            return 'some value'
        case 'number':
            return 123
        case 'boolean':
            return true
        default:
            return 'some value'
    }
}

describe('<TicketField />', () => {
    const defaultState = {
        ticket: fromJS({
            id: 'whateva',
        }),
    }

    const store = mockStore(defaultState)
    const queryClient = mockQueryClient()

    const baseFieldState = {
        hasError: false,
    }

    const onChange = jest.fn()

    it.each(ticketFieldDefinitions)(
        'should render the appropriate field',
        (customField) => {
            const fieldState = {
                ...baseFieldState,
                value: getValueForDataType(customField.definition.data_type),
                id: customField.id,
            }
            const { container } = render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketField
                            fieldDefinition={customField}
                            fieldState={fieldState}
                            isRequired={isFieldRequired(customField)}
                        />
                    </Provider>
                </QueryClientProvider>,
            )
            expect(container).toMatchSnapshot()
            expect(onChange).not.toHaveBeenCalled()
        },
    )

    it.each([
        {
            ...ticketInputFieldDefinition,
            definition: {
                ...ticketInputFieldDefinition.definition,
                data_type: 'number' as CustomField['definition']['data_type'],
            },
        },
        {
            ...ticketDropdownFieldDefinition,
            definition: {
                ...ticketDropdownFieldDefinition.definition,
                data_type: 'number' as CustomField['definition']['data_type'],
            },
        },
    ])('should render coming soon for unsupported fields', (customField) => {
        const fieldState = {
            ...baseFieldState,
            value: getValueForDataType(customField.definition.data_type),
            id: customField.id,
        }
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketField
                        // @ts-ignore - we're testing an unsupported/untyped field
                        fieldDefinition={customField}
                        fieldState={fieldState}
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [
            {
                ...ticketInputFieldDefinition,
                definition: {
                    ...ticketInputFieldDefinition.definition,
                },
            },
            false,
        ],
        [
            {
                ...ticketInputFieldDefinition,
                definition: {
                    ...ticketInputFieldDefinition.definition,
                },
                managed_type: 'contact_reason' as
                    | ManagedTicketFieldType
                    | ManagedCustomerFieldType
                    | null,
            },
            false,
        ],
        [
            {
                ...ticketInputFieldDefinition,
                definition: {
                    ...ticketInputFieldDefinition.definition,
                },
                managed_type: 'ai_intent' as
                    | ManagedTicketFieldType
                    | ManagedCustomerFieldType
                    | null,
            },
            true,
        ],
        [
            {
                ...ticketInputFieldDefinition,
                definition: {
                    ...callStatusManagedTicketInputFieldDefinition.definition,
                },
                managed_type: ManagedTicketFieldType.CallStatus,
            },
            true,
        ],
    ])(
        'should render enabled or disabled fields according to managed_type',
        (customField: CustomField, shouldBeDisabled: boolean) => {
            const fieldState = {
                ...baseFieldState,
                value: getValueForDataType(customField.definition.data_type),
                id: customField.id,
            }
            render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketField
                            fieldDefinition={customField}
                            fieldState={fieldState}
                            isRequired={isFieldRequired(customField)}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            if (shouldBeDisabled) {
                expect(
                    screen
                        .getByPlaceholderText('Some placeholder')
                        .closest('input'),
                ).toBeDisabled()
            } else {
                expect(
                    screen
                        .getByPlaceholderText('Some placeholder')
                        .closest('input'),
                ).toBeEnabled()
            }
        },
    )
})
