import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    ticketDropdownFieldDefinition,
    ticketFieldDefinitions,
    ticketInputFieldDefinition,
} from 'fixtures/customField'

import {CustomFieldDefinition} from 'models/customField/types'
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
            const {container} = render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketField
                            fieldDefinition={customField}
                            fieldState={fieldState}
                        />
                    </Provider>
                </QueryClientProvider>
            )
            expect(container).toMatchSnapshot()
            expect(onChange).not.toHaveBeenCalled()
        }
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
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketField
                        // @ts-ignore - we're testing an unsupported/untyped field
                        fieldDefinition={customField}
                        fieldState={fieldState}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
