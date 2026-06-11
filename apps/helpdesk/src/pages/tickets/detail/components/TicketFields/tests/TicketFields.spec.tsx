import React from 'react'

import client from '@repo/api-resources'
import { useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    ExpressionFieldSource,
    ExpressionFieldType,
    ExpressionOperator,
    RequirementType,
    TicketStatus,
} from '@gorgias/helpdesk-types'

import { useCustomFieldConditions } from 'custom-fields/hooks/queries/useCustomFieldConditions'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    aiManagedTicketInputFieldDefinition,
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { DefaultExportTicketFields as TicketFields } from '../TicketFields'

jest.mock('custom-fields/hooks/queries/useCustomFieldConditions', () => ({
    useCustomFieldConditions: jest.fn(() => ({
        customFieldConditions: [],
        isLoading: false,
    })),
}))
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(() => ({
        data: { data: [] },
        isLoading: false,
    })),
}))
jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => createMockStandaloneAiAccess()),
}))
jest.mock('@repo/feature-flags')

const mockedUseCustomFieldConditions = assumeMock(useCustomFieldConditions)
const mockedUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)
const mockedUseFlag = assumeMock(useFlag)
const mockedUseStandaloneAiAccess = assumeMock(useStandaloneAiAccess)

const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()
const mockStore = configureMockStore()

describe('<TicketFields />', () => {
    const conditionalTicketField = {
        ...ticketInputFieldDefinition,
        id: 101,
        required: false,
        requirement_type: RequirementType.Conditional,
        label: 'Conditional field',
    }
    const makeOnOpenAndAnotherFieldSetCustomFieldCondition = (
        type: ExpressionFieldType,
    ) => ({
        ...customFieldCondition,
        requirements: [{ type: type, field_id: conditionalTicketField.id }],
        expression: [
            {
                field: 'status',
                values: [TicketStatus.Open],
                operator: ExpressionOperator.Is,
                field_source: ExpressionFieldSource.Ticket,
            },
            {
                field: ticketInputFieldDefinition.id,
                values: ['Refund'],
                operator: ExpressionOperator.Is,
                field_source: ExpressionFieldSource.TicketCustomFields,
            },
        ],
    })

    const baseFieldState = {
        value: 'some value',
        hasError: false,
    }
    const defaultState = {
        ticket: fromJS({
            id: 1000,
            custom_fields: {
                [ticketDropdownFieldDefinition.id]: {
                    id: ticketDropdownFieldDefinition.id,
                    ...baseFieldState,
                },
                [ticketInputFieldDefinition.id]: {
                    ...baseFieldState,
                    id: ticketInputFieldDefinition.id,
                    value: 'Refund',
                },
            },
        }),
    }

    const store = mockStore(defaultState)

    beforeEach(() => {
        mockedServer.reset()
        queryClient.clear()
        mockedUseFlag.mockReturnValue(true)
        mockedUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess(),
        )
    })

    it('should not render if there is no custom field definition', () => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>,
        )
        expect(container.firstChild).toBeNull()
    })

    it('should render if there is a custom field definition', async () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: {
                data: [
                    ticketDropdownFieldDefinition,
                    ticketInputFieldDefinition,
                ],
            },
            isLoading: false,
        } as any)

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>,
        )
        await waitFor(() => {
            expect(
                screen.getByText(RegExp(ticketInputFieldDefinition.label)),
            ).toBeDefined()
        })
    })

    it.each([ExpressionFieldType.Required, ExpressionFieldType.Visible])(
        'should render the %s conditional field if conditions are met',
        async (type) => {
            mockedUseCustomFieldDefinitions.mockReturnValue({
                data: {
                    data: [conditionalTicketField, ticketInputFieldDefinition],
                },
                isLoading: false,
            } as any)
            mockedUseCustomFieldConditions.mockReturnValue({
                customFieldConditions: [
                    makeOnOpenAndAnotherFieldSetCustomFieldCondition(type),
                ],
                isLoading: false,
            } as any)
            const store = mockStore({
                ticket: fromJS({
                    id: 1000,
                    custom_fields: {
                        [ticketDropdownFieldDefinition.id]: {
                            id: ticketDropdownFieldDefinition.id,
                            ...baseFieldState,
                        },
                        [ticketInputFieldDefinition.id]: {
                            ...baseFieldState,
                            id: ticketInputFieldDefinition.id,
                            value: 'Refund',
                        },
                    },
                    status: TicketStatus.Open,
                }),
            })

            render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketFields />
                    </Provider>
                </QueryClientProvider>,
            )
            await waitFor(() => {
                expect(
                    screen.getByText(RegExp(ticketInputFieldDefinition.label)),
                ).toBeDefined()
                expect(
                    screen.getByText(RegExp(conditionalTicketField.label)),
                ).toBeDefined()
            })
        },
    )

    it.each([ExpressionFieldType.Required, ExpressionFieldType.Visible])(
        'should not render the %s conditional field if conditions are not met',
        async (type) => {
            mockedUseCustomFieldDefinitions.mockReturnValue({
                data: {
                    data: [conditionalTicketField, ticketInputFieldDefinition],
                },
                isLoading: false,
            } as any)
            mockedUseCustomFieldConditions.mockReturnValue({
                customFieldConditions: [
                    makeOnOpenAndAnotherFieldSetCustomFieldCondition(type),
                ],
                isLoading: false,
            } as any)
            render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketFields />
                    </Provider>
                </QueryClientProvider>,
            )
            await waitFor(() => {
                expect(
                    screen.getByText(RegExp(ticketInputFieldDefinition.label)),
                ).toBeDefined()
                expect(
                    screen.queryByText(RegExp(conditionalTicketField.label)),
                ).not.toBeInTheDocument()
            })
        },
    )

    it('should render all fields if feature flag is off', async () => {
        mockedUseFlag.mockReturnValue(false)
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: {
                data: [conditionalTicketField, ticketInputFieldDefinition],
            },
            isLoading: false,
        } as any)

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>,
        )
        await waitFor(() => {
            expect(
                screen.getByText(RegExp(ticketInputFieldDefinition.label)),
            ).toBeDefined()
            expect(
                screen.queryByText(RegExp(conditionalTicketField.label)),
            ).toBeDefined()
        })
    })

    it('should only render AI-managed fields for standalone ai agents', async () => {
        mockedUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
            }),
        )
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: {
                data: [
                    ticketInputFieldDefinition,
                    aiManagedTicketInputFieldDefinition,
                ],
            },
            isLoading: false,
        } as any)

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    RegExp(aiManagedTicketInputFieldDefinition.label),
                ),
            ).toBeDefined()
            expect(
                screen.queryByText(RegExp(ticketInputFieldDefinition.label)),
            ).not.toBeInTheDocument()
        })
    })
})
