import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {QueryClientProvider} from '@tanstack/react-query'

import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {
    ticketDropdownFieldDefinition,
    ticketFieldDefinitions,
    ticketInputFieldDefinition,
} from 'fixtures/customField'

import TicketField from '../TicketField'

const mockStore = configureMockStore()

describe('<TicketField />', () => {
    const defaultState = {
        ticket: fromJS({
            id: 'whateva',
        }),
    }

    const store = mockStore(defaultState)
    const queryClient = createTestQueryClient()

    const basefieldState = {
        value: 'some value',
        hasError: false,
    }

    const onChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it.each(ticketFieldDefinitions)(
        'should render the appropriate field',
        (definition) => {
            const fieldState = {
                ...basefieldState,
                id: definition.id,
            }
            const {container} = render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketField
                            fieldDefinition={definition}
                            fieldState={fieldState}
                        />
                    </Provider>
                </QueryClientProvider>
            )
            expect(container.firstChild).toMatchSnapshot()
            expect(onChange).not.toHaveBeenCalled()
        }
    )

    it.each([
        {
            ...ticketInputFieldDefinition,
            definition: {
                ...ticketInputFieldDefinition.definition,
                data_type: 'number',
            },
        },
        {
            ...ticketDropdownFieldDefinition,
            definition: {
                ...ticketDropdownFieldDefinition.definition,
                data_type: 'number',
            },
        },
    ])('should render coming soon for unsupported fields', (definition) => {
        const fieldState = {
            ...basefieldState,
            id: definition.id,
        }
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketField
                        // @ts-ignore - we're testing an unsupported/untyped field
                        fieldDefinition={definition}
                        fieldState={fieldState}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
