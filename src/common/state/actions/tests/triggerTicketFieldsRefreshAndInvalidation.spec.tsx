import {listCustomFieldConditions} from '@gorgias/api-client'
import {CustomFieldRequirementType} from '@gorgias/api-queries'
import {
    ExpressionFieldSource,
    ExpressionFieldType,
    ExpressionOperator,
} from '@gorgias/api-types'
import {QueryClientProvider} from '@tanstack/react-query'
import {render, waitFor, screen} from '@testing-library/react'
import {Map} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import {appQueryClient} from 'api/queryClient'
import useFlag from 'common/flags/hooks/useFlag'
import {FeatureFlagKey} from 'config/featureFlags'
import {getCustomFields} from 'custom-fields/resources'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import {customFieldCondition} from 'fixtures/customFieldCondition'
import TicketFields from 'pages/tickets/detail/components/TicketFields/TicketFields'
import {initialState as newMessageState} from 'state/newMessage/reducers'
import {initialState as ticketState} from 'state/ticket/reducers'
import {StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import triggerTicketFieldsRefreshAndInvalidation from '../triggerTicketFieldsRefreshAndInvalidation'

type MockedRootState = {
    ticket: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
    views?: Map<any, any>
}

jest.mock('custom-fields/resources')
jest.mock('@gorgias/api-client')
jest.mock('common/flags/hooks/useFlag')

const mockedGetCustomFields = assumeMock(getCustomFields)
const mockedListCustomFieldConditions = assumeMock(listCustomFieldConditions)
const mockedUseFlag = assumeMock(useFlag)

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

describe('triggerTicketFieldsRefreshAndInvalidation()', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>

    const conditionalTicketField = {
        ...ticketDropdownFieldDefinition,
        id: 121,
        requirement_type: CustomFieldRequirementType.Conditional,
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
        mockedGetCustomFields.mockResolvedValue({
            data: {data: [visibleTicketField]},
        } as any)
        mockedListCustomFieldConditions.mockResolvedValue({
            data: {
                data: [],
            },
        } as any)
    })

    it('should dispatch SET_INVALID_CUSTOM_FIELDS_TO_ERRORED with correct errored fields with flag disabled', async () => {
        // Mock the flag
        mockFlags({[FeatureFlagKey.TicketConditionalFields]: false})

        // Render the queries and cache the data
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>
        )
        await waitFor(() => {
            expect(
                screen.getByText(RegExp(visibleTicketField.label))
            ).toBeDefined()
        })

        // Mock the data for invalidation and re-fetch
        mockedGetCustomFields.mockResolvedValue({
            data: {
                data: [
                    conditionalTicketField,
                    visibleTicketField,
                    requiredTicketField,
                ],
            },
        } as any)

        // Trigger refresh and invalidation
        await store.dispatch(triggerTicketFieldsRefreshAndInvalidation())
        expect(store.getActions()).toEqual([
            {
                payload: [requiredTicketField.id],
                type: 'SET_INVALID_CUSTOM_FIELDS_TO_ERRORED',
            },
        ])
    })

    it('should dispatch SET_INVALID_CUSTOM_FIELDS_TO_ERRORED with correct errored fields with flag enabled', async () => {
        // Mock the flag
        mockedUseFlag.mockReturnValue(true)
        mockFlags({[FeatureFlagKey.TicketConditionalFields]: true})

        // Render the queries and cache the data
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>
        )
        await waitFor(() => {
            expect(
                screen.getAllByText(RegExp(visibleTicketField.label))
            ).toBeDefined()
        })

        // Mock the data for invalidation and re-fetch
        mockedGetCustomFields.mockResolvedValue({
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
