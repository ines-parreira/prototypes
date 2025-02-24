import {
    ExpressionFieldSource,
    ExpressionFieldType,
    ExpressionOperator,
    TicketStatus,
    RequirementType,
} from '@gorgias/api-types'
import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import useFlag from 'core/flags/hooks/useFlag'
import {useCustomFieldConditions} from 'custom-fields/hooks/queries/useCustomFieldConditions'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import {customFieldCondition} from 'fixtures/customFieldCondition'
import useHasWrapped from 'hooks/useHasWrapped'
import client from 'models/api/resources'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {assumeMock} from 'utils/testing'

import {MAX_HEIGHT} from '../hooks/useHeight'
import TicketFields from '../TicketFields'

jest.mock('custom-fields/hooks/queries/useCustomFieldConditions', () => ({
    useCustomFieldConditions: jest.fn(() => ({
        customFieldConditions: [],
        isLoading: false,
    })),
}))
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(() => ({
        data: {data: []},
        isLoading: false,
    })),
}))
jest.mock('core/flags/hooks/useFlag')
jest.mock('hooks/useHasWrapped')
jest.mock(
    'pages/tickets/detail/components/TicketFields/hooks/useHeight',
    () => ({
        __esModule: true,
        default: () => 500,
        MAX_HEIGHT: 500,
    })
)

const mockedUseCustomFieldConditions = assumeMock(useCustomFieldConditions)
const mockedUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)
const mockedUseFlag = assumeMock(useFlag)
const mockedUseHasWrapped = assumeMock(useHasWrapped)

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
        type: ExpressionFieldType
    ) => ({
        ...customFieldCondition,
        requirements: [{type: type, field_id: conditionalTicketField.id}],
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
        mockedUseHasWrapped.mockReturnValue([
            {current: document.createElement('div')},
            true,
        ])
    })

    it('should not render if there is no custom field definition', () => {
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
            </QueryClientProvider>
        )
        await waitFor(() => {
            expect(
                screen.getByText(RegExp(ticketInputFieldDefinition.label))
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
                </QueryClientProvider>
            )
            await waitFor(() => {
                expect(
                    screen.getByText(RegExp(ticketInputFieldDefinition.label))
                ).toBeDefined()
                expect(
                    screen.getByText(RegExp(conditionalTicketField.label))
                ).toBeDefined()
            })
        }
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
                </QueryClientProvider>
            )
            await waitFor(() => {
                expect(
                    screen.getByText(RegExp(ticketInputFieldDefinition.label))
                ).toBeDefined()
                expect(
                    screen.queryByText(RegExp(conditionalTicketField.label))
                ).not.toBeInTheDocument()
            })
        }
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
            </QueryClientProvider>
        )
        await waitFor(() => {
            expect(
                screen.getByText(RegExp(ticketInputFieldDefinition.label))
            ).toBeDefined()
            expect(
                screen.queryByText(RegExp(conditionalTicketField.label))
            ).toBeDefined()
        })
    })

    it('should not render `show more` button if ref is not wrapped', () => {
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: {
                data: [ticketInputFieldDefinition],
            },
            isLoading: false,
        } as any)
        mockedUseHasWrapped.mockReturnValue([
            {current: document.createElement('div')},
            false,
        ])
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>
        )
        const showMoreButton = screen.queryByText('Show more')
        expect(showMoreButton).not.toBeInTheDocument()
    })

    it('should render fields container as scrollable if scroll height is higher than MAX_HEIGHT', async () => {
        mockedUseHasWrapped.mockReturnValue([
            {current: document.createElement('div')},
            true,
        ])
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: {
                data: Array.from({length: 30}, (_, index) => ({
                    ...ticketInputFieldDefinition,
                    id: 1001 + index,
                    label: `Input field ${index + 1}`,
                })),
            },
            isLoading: false,
        } as any)

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>
        )
        Object.defineProperty(
            screen.getByTestId('fields-container'),
            'scrollHeight',
            {
                configurable: true,
                value: MAX_HEIGHT + 1,
            }
        )
        const showMoreButton = screen.getByText('Show more')
        showMoreButton.click()
        await waitFor(() => {
            expect(screen.queryByText('Show more')).not.toBeInTheDocument()
            expect(screen.getByText('Show less')).toBeInTheDocument()
            const container = screen.getByTestId('fields-container')
            expect(container.className).toContain('isScrollable')
        })
    })
})
