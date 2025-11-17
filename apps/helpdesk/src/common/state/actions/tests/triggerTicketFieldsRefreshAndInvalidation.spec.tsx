import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type { Map } from 'immutable'
import { Provider } from 'react-redux'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    listCustomFieldConditions,
    listCustomFields,
} from '@gorgias/helpdesk-client'
import { RequirementType } from '@gorgias/helpdesk-queries'
import {
    ExpressionFieldSource,
    ExpressionFieldType,
    ExpressionOperator,
} from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import TicketFields from 'pages/tickets/detail/components/TicketFields/TicketFields'
import { initialState as newMessageState } from 'state/newMessage/reducers'
import { initialState as ticketState } from 'state/ticket/reducers'
import type { StoreDispatch } from 'state/types'

import triggerTicketFieldsRefreshAndInvalidation from '../triggerTicketFieldsRefreshAndInvalidation'

type MockedRootState = {
    ticket: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
    views?: Map<any, any>
}

jest.mock('@gorgias/helpdesk-client')
jest.mock('core/flags/hooks/useFlag')

const mockedListCustomFields = assumeMock(listCustomFields)
const mockedListCustomFieldConditions = assumeMock(listCustomFieldConditions)

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares,
)

describe('triggerTicketFieldsRefreshAndInvalidation()', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>

    const conditionalTicketField = {
        ...ticketDropdownFieldDefinition,
        id: 121,
        requirement_type: RequirementType.Conditional,
    }
    const visibleTicketField = {
        ...ticketInputFieldDefinition,
        id: 122,
        required: false,
    }
    const requiredTicketField = {
        ...ticketInputFieldDefinition,
        id: 123,
        required: true,
    }

    beforeEach(() => {
        store = mockStore({
            ticket: ticketState,
            newMessage: newMessageState,
        })
        mockedListCustomFields.mockResolvedValue({
            data: { data: [visibleTicketField] },
        } as any)
        mockedListCustomFieldConditions.mockResolvedValue({
            data: {
                data: [],
            },
        } as any)
    })

    it('should dispatch SET_INVALID_CUSTOM_FIELDS_TO_ERRORED with correct errored fields', async () => {
        // Render the queries and cache the data
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>,
        )
        await waitFor(() => {
            expect(
                screen.getAllByText(RegExp(visibleTicketField.label)),
            ).toBeDefined()
        })

        // Mock the data for invalidation and re-fetch
        mockedListCustomFields.mockResolvedValue({
            data: {
                data: [
                    conditionalTicketField,
                    visibleTicketField,
                    requiredTicketField,
                ],
            },
        } as any)

        mockedListCustomFieldConditions.mockResolvedValue({
            data: {
                data: [
                    {
                        ...customFieldCondition,
                        name: 'Required when open',
                        id: 1,
                        expression: [
                            {
                                field: 'status',
                                operator: ExpressionOperator.Is,
                                values: ['open'],
                                field_source: ExpressionFieldSource.Ticket,
                            },
                        ],
                        requirements: [
                            {
                                field_id: conditionalTicketField.id,
                                type: ExpressionFieldType.Required,
                            },
                        ],
                    },
                ],
            },
        } as any)

        // Trigger refresh and invalidation
        await store.dispatch(triggerTicketFieldsRefreshAndInvalidation())
        expect(store.getActions()).toEqual([
            {
                payload: [conditionalTicketField.id, requiredTicketField.id],
                type: 'SET_INVALID_CUSTOM_FIELDS_TO_ERRORED',
            },
        ])
    })
})
