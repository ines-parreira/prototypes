import { appQueryClient } from '@repo/api-resources'
import { assumeMock, render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import type { Map } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockListCustomFieldConditionsHandler,
    mockListCustomFieldConditionsResponse,
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
} from '@gorgias/helpdesk-mocks'
import {
    ExpressionFieldSource,
    ExpressionFieldType,
    ExpressionOperator,
    RequirementType,
} from '@gorgias/helpdesk-types'

import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { DefaultExportTicketFields as TicketFields } from 'pages/tickets/detail/components/TicketFields/TicketFields'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { initialState as newMessageState } from 'state/newMessage/reducers'
import { initialState as ticketState } from 'state/ticket/reducers'
import type { StoreDispatch } from 'state/types'

import { triggerTicketFieldsRefreshAndInvalidation } from '../triggerTicketFieldsRefreshAndInvalidation'

type MockedRootState = {
    ticket: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
    views?: Map<any, any>
}

jest.mock('@repo/feature-flags')
jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => createMockStandaloneAiAccess()),
}))

const mockUseStandaloneAiAccess = assumeMock(useStandaloneAiAccess)
const server = setupServer()

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
    const requiredWhenOpenCondition = {
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
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        store = mockStore({
            ticket: ticketState,
            newMessage: newMessageState,
        })
        mockUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess(),
        )
        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [visibleTicketField],
                    }),
                ),
            ).handler,
            mockListCustomFieldConditionsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldConditionsResponse({
                        data: [],
                    }),
                ),
            ).handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
        appQueryClient.clear()
    })

    afterAll(() => {
        server.close()
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
        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [
                            conditionalTicketField,
                            visibleTicketField,
                            requiredTicketField,
                        ],
                    }),
                ),
            ).handler,
            mockListCustomFieldConditionsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldConditionsResponse({
                        data: [requiredWhenOpenCondition],
                    }),
                ),
            ).handler,
        )

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
