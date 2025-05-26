import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { ManagedTicketFieldType } from '@gorgias/helpdesk-types'

import { isFieldRequired } from 'custom-fields/helpers/isFieldRequired'
import { CustomFieldDefinition } from 'custom-fields/types'
import {
    callStatusManagedTicketInputFieldDefinition,
    ticketDropdownFieldDefinition,
    ticketFieldDefinitions,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import TicketField from '../TicketField'

const mockStore = configureMockStore()

function getValueForDataType(dataType: CustomFieldDefinition['data_type']) {
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
                data_type: 'number' as CustomFieldDefinition['data_type'],
            },
        },
        {
            ...ticketDropdownFieldDefinition,
            definition: {
                ...ticketDropdownFieldDefinition.definition,
                data_type: 'number' as CustomFieldDefinition['data_type'],
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
        {
            ...ticketInputFieldDefinition,
            definition: {
                ...ticketInputFieldDefinition.definition,
            },
            should_be_disabled: false,
        },
        {
            ...ticketInputFieldDefinition,
            definition: {
                ...ticketInputFieldDefinition.definition,
            },
            managed_type: 'contact_reason',
            should_be_disabled: false,
        },
        {
            ...ticketInputFieldDefinition,
            definition: {
                ...ticketInputFieldDefinition.definition,
            },
            managed_type: 'ai_intent',
            should_be_disabled: true,
        },
        {
            ...ticketInputFieldDefinition,
            definition: {
                ...callStatusManagedTicketInputFieldDefinition.definition,
            },
            managed_type: ManagedTicketFieldType.CallStatus,
            should_be_disabled: true,
        },
    ])(
        'should render enabled or disabled fields according to managed_type',
        (customField) => {
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

            if (customField.should_be_disabled) {
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
