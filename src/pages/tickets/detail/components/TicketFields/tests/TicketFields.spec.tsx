import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {QueryClientProvider} from '@tanstack/react-query'

import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import client from 'models/api/resources'

import TicketFields from '../TicketFields'

const mockedMutate = jest.fn()
jest.mock('models/customField/queries', () => {
    return {
        ...jest.requireActual('models/customField/queries'),
        useUpdateOrDeleteTicketFieldValue: () => ({mutate: mockedMutate}),
    } as Record<string, unknown>
})

const mockedServer = new MockAdapter(client)
const queryClient = createTestQueryClient()
const mockStore = configureMockStore()

describe('<TicketFields />', () => {
    const baseFieldState = {
        value: 'some value',
        hasError: false,
    }
    const defaultState = {
        ticket: fromJS({
            id: 'whateva',
            custom_fields: {
                [ticketDropdownFieldDefinition.id]: {
                    id: ticketDropdownFieldDefinition.id,
                    ...baseFieldState,
                },
                [ticketInputFieldDefinition.id]: {
                    id: ticketInputFieldDefinition.id,
                    ...baseFieldState,
                },
            },
        }),
    }

    const store = mockStore(defaultState)

    beforeEach(async () => {
        mockedServer.reset()
        await queryClient.invalidateQueries()
    })

    it('should not render if there is no custom field definition', () => {
        mockedServer.onGet('/api/custom-fields/').reply(200, {
            data: [],
        })

        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>
        )
        expect(container.firstChild).toBeNull()
    })

    it('should render if there is a custom field definition', async () => {
        mockedServer.onGet('/api/custom-fields/').reply(200, {
            data: [ticketDropdownFieldDefinition, ticketInputFieldDefinition],
        })

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>
        )
        await waitFor(() => {
            expect(
                screen.getByText(RegExp(ticketInputFieldDefinition.label))
            ).toBeDefined()
        })
    })

    it('should provide an isLarge prop if they are less than 4 custom fields', async () => {
        mockedServer.onGet('/api/custom-fields/').reply(200, {
            data: [
                ticketDropdownFieldDefinition,
                ticketDropdownFieldDefinition,
                ticketInputFieldDefinition,
            ],
        })

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>
        )
        await waitFor(() => {
            const input = screen.getAllByRole('textbox')[0]
            expect(input.classList.contains('large')).toBe(true)
        })
    })
})
