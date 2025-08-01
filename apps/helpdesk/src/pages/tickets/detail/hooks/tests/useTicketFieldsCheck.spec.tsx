import { assumeMock, renderHook } from '@repo/testing'
import { Map as mockMap } from 'immutable'

import { RequirementType } from '@gorgias/helpdesk-queries'
import {
    ExpressionFieldSource,
    ExpressionFieldType,
    ExpressionOperator,
    TicketStatus,
} from '@gorgias/helpdesk-types'

import { useCustomFieldConditions } from 'custom-fields/hooks/queries/useCustomFieldConditions'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { ticketInputFieldDefinition as mockTicketInputFieldDefinition } from 'fixtures/customField'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { setCustomFieldValueAction as mockSetCustomFieldValueAction } from 'fixtures/macro'
import {
    setHasAttemptedToCloseTicket,
    triggerTicketFieldsErrors,
} from 'state/ticket/actions'
import {
    getAppliedMacro,
    getTicket,
    getTicketFieldState,
} from 'state/ticket/selectors'

import { useTicketFieldsCheck } from '../useTicketFieldsCheck'

const TICKET_ID = 1

const mockedDispatch = jest.fn()
const mockRequiredCustomField = {
    ...mockTicketInputFieldDefinition,
    required: true,
    label: 'Intent',
}
const mockConditionalCustomField = {
    ...mockTicketInputFieldDefinition,
    id: 101,
    required: false,
    requirement_type: RequirementType.Conditional,
}
const mockRequiredOnIntentAndOpenCustomFieldCondition = {
    ...customFieldCondition,

    requirements: [
        {
            type: ExpressionFieldType.Required,
            field_id: mockConditionalCustomField.id,
        },
    ],
    expression: [
        {
            field: 'status',
            values: [TicketStatus.Open],
            operator: ExpressionOperator.Is,
            field_source: ExpressionFieldSource.Ticket,
        },
        {
            field: mockRequiredCustomField.id,
            values: ['Refund'],
            operator: ExpressionOperator.Is,
            field_source: ExpressionFieldSource.TicketCustomFields,
        },
    ],
}

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('hooks/useAppSelector', () => jest.fn((fn: () => unknown) => fn()))
jest.mock('state/ticket/actions', () => ({
    setHasAttemptedToCloseTicket: jest.fn(),
    triggerTicketFieldsErrors: jest.fn(),
}))

jest.mock('state/ticket/selectors', () => ({
    getAppliedMacro: jest.fn(),
    getTicketFieldState: jest.fn(),
    getTicket: jest.fn(() => ({
        status: 'open',
        custom_fields: {},
    })),
}))

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(() => ({
        data: {
            data: [mockRequiredCustomField],
        },
        isLoading: false,
    })),
}))
jest.mock('custom-fields/hooks/queries/useCustomFieldConditions', () => ({
    useCustomFieldConditions: jest.fn(() => ({
        customFieldConditions: [],
        isLoading: false,
    })),
}))
jest.mock('core/flags/hooks/useFlag')
const mockedUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)
const mockedUseCustomFieldConditions = assumeMock(useCustomFieldConditions)
const mockedTriggerTicketFieldsErrors = assumeMock(triggerTicketFieldsErrors)
const mockedGetAppliedMacro = assumeMock(getAppliedMacro)
const mockedGetTicketFieldState = assumeMock(getTicketFieldState)
const mockedGetTicket = assumeMock(getTicket)

// Data here is valid because the required field is provided by the macro
function mockValidData() {
    const ticketFieldsState = {
        [mockRequiredCustomField.id]: {
            id: mockRequiredCustomField.id,
            value: '',
        },
        [mockConditionalCustomField.id]: {
            id: mockConditionalCustomField.id,
            value: '',
        },
    }
    mockedGetAppliedMacro.mockImplementation(() =>
        mockMap({
            actions: [
                {
                    ...mockSetCustomFieldValueAction,
                    arguments: {
                        ...mockSetCustomFieldValueAction.arguments,
                        value: 'Refund',
                        custom_field_id: mockRequiredCustomField.id,
                    },
                },
            ],
        }),
    )
    mockedGetTicketFieldState.mockImplementation(() => ticketFieldsState)
    mockedGetTicket.mockReturnValue(
        jest.fn(() => ({
            status: 'open',
            custom_fields: ticketFieldsState,
        })) as any,
    )
}

// Data here is invalid because the required field is not provided by the macro
function mockInvalidData() {
    mockedGetAppliedMacro.mockImplementation(() => {
        return mockMap({
            actions: [],
        })
    })
    mockedGetTicketFieldState.mockImplementation(() => ({
        [mockRequiredCustomField.id]: {
            id: mockRequiredCustomField.id,
            value: '',
        },
        [mockConditionalCustomField.id]: {
            id: mockConditionalCustomField.id,
            value: '',
        },
    }))
}

describe('useTicketFieldsCheck', () => {
    beforeEach(() => {
        mockedGetAppliedMacro.mockClear()
        mockedGetTicketFieldState.mockClear()
    })

    it('should return false if no ticket field is invalid', () => {
        mockValidData()
        const { result } = renderHook(() => useTicketFieldsCheck(TICKET_ID))
        expect(mockedDispatch).not.toHaveBeenCalled()
        expect(
            result.current.checkTicketFieldErrors({ includeMacro: true }),
        ).toEqual(false)
    })

    it('should return ignore macro data if include macro is not set', () => {
        mockValidData()
        const { result } = renderHook(() => useTicketFieldsCheck(TICKET_ID))
        expect(mockedDispatch).not.toHaveBeenCalled()
        expect(result.current.checkTicketFieldErrors()).toEqual(true)
    })

    it('should return true if at least on ticket field is invalid and dispatch an action', () => {
        mockInvalidData()
        const { result } = renderHook(() => useTicketFieldsCheck(TICKET_ID))
        expect(result.current.checkTicketFieldErrors()).toEqual(true)
        expect(mockedTriggerTicketFieldsErrors).toHaveBeenCalledWith([
            mockTicketInputFieldDefinition.id,
        ])
        expect(setHasAttemptedToCloseTicket).toHaveBeenCalledWith(true)

        expect(mockedDispatch).toHaveBeenCalledTimes(2)
    })

    it('should ignore invalid fields if custom field definitions is loading', () => {
        mockInvalidData()
        mockedUseCustomFieldDefinitions.mockImplementation(
            () =>
                ({
                    data: {
                        data: [mockTicketInputFieldDefinition],
                    },
                    isLoading: true,
                }) as unknown as ReturnType<typeof useCustomFieldDefinitions>,
        )

        const { result } = renderHook(() => useTicketFieldsCheck(TICKET_ID))

        expect(
            result.current.checkTicketFieldErrors({ includeMacro: true }),
        ).toEqual(false)
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
        expect(setHasAttemptedToCloseTicket).toHaveBeenCalledWith(false)
    })

    it('should no break if there is no applied macro', () => {
        mockedGetAppliedMacro.mockImplementation(() => null)
        mockedUseCustomFieldDefinitions.mockImplementation(
            () =>
                ({
                    data: {
                        data: [mockTicketInputFieldDefinition],
                    },
                    isLoading: false,
                }) as unknown as ReturnType<typeof useCustomFieldDefinitions>,
        )

        const { result } = renderHook(() => useTicketFieldsCheck(TICKET_ID))

        expect(
            result.current.checkTicketFieldErrors({ includeMacro: true }),
        ).toEqual(false)
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
        expect(setHasAttemptedToCloseTicket).toHaveBeenCalledWith(false)
    })

    it('should return true if there is a conditional ticket field that was evaluated as required', () => {
        mockedUseCustomFieldDefinitions.mockImplementation(
            () =>
                ({
                    data: {
                        data: [
                            mockRequiredCustomField,
                            mockConditionalCustomField,
                        ],
                    },
                    isLoading: false,
                }) as unknown as ReturnType<typeof useCustomFieldDefinitions>,
        )

        mockedGetTicket.mockReturnValue({
            status: TicketStatus.Open,
            custom_fields: {
                [mockRequiredCustomField.id]: {
                    id: mockRequiredCustomField.id,
                    value: 'Refund',
                },
            },
        } as any)
        mockedGetTicketFieldState.mockReturnValue({
            [mockRequiredCustomField.id]: {
                id: mockRequiredCustomField.id,
                value: 'Refund',
            },
        })
        mockedUseCustomFieldConditions.mockReturnValue({
            customFieldConditions: [
                mockRequiredOnIntentAndOpenCustomFieldCondition,
            ],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useTicketFieldsCheck(TICKET_ID))

        expect(result.current.checkTicketFieldErrors()).toEqual(true)
    })

    it('should return false if there is a conditional ticket field that was evaluated as required, but macro fills it up', () => {
        mockedUseCustomFieldDefinitions.mockImplementation(
            () =>
                ({
                    data: {
                        data: [
                            mockRequiredCustomField,
                            mockConditionalCustomField,
                        ],
                    },
                    isLoading: false,
                }) as unknown as ReturnType<typeof useCustomFieldDefinitions>,
        )

        mockedGetTicket.mockReturnValue({
            status: TicketStatus.Open,
            custom_fields: {
                [mockRequiredCustomField.id]: {
                    id: mockRequiredCustomField.id,
                    value: 'Refund',
                },
            },
        } as any)
        mockedGetTicketFieldState.mockReturnValue({
            [mockRequiredCustomField.id]: {
                id: mockRequiredCustomField.id,
                value: 'Refund',
            },
        })
        mockedUseCustomFieldConditions.mockReturnValue({
            customFieldConditions: [
                mockRequiredOnIntentAndOpenCustomFieldCondition,
            ],
            isLoading: false,
            isError: false,
        })
        mockedGetAppliedMacro.mockImplementation(() =>
            mockMap({
                actions: [
                    {
                        ...mockSetCustomFieldValueAction,
                        arguments: {
                            ...mockSetCustomFieldValueAction.arguments,
                            value: 'Set the conditional field.',
                            custom_field_id: mockConditionalCustomField.id,
                        },
                    },
                ],
            }),
        )

        const { result } = renderHook(() => useTicketFieldsCheck(TICKET_ID))

        expect(
            result.current.checkTicketFieldErrors({ includeMacro: true }),
        ).toEqual(false)
    })
})
