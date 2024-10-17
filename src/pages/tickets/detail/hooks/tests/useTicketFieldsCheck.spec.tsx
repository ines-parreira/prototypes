import {renderHook} from '@testing-library/react-hooks'
import {Map as mockMap} from 'immutable'

import {
    setHasAttemptedToCloseTicket,
    triggerTicketFieldsErrors,
} from 'state/ticket/actions'
import {getAppliedMacro, getTicketFieldState} from 'state/ticket/selectors'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {ticketInputFieldDefinition as mockTicketInputFieldDefinition} from 'fixtures/customField'
import {setCustomFieldValueAction as mockSetCustomFieldValueAction} from 'fixtures/macro'
import {assumeMock} from 'utils/testing'

import {useTicketFieldsCheck} from '../useTicketFieldsCheck'

const TICKET_ID = 1

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('hooks/useAppSelector', () => jest.fn((fn: () => unknown) => fn()))
jest.mock('state/ticket/actions', () => ({
    setHasAttemptedToCloseTicket: jest.fn(),
    triggerTicketFieldsErrors: jest.fn(),
}))

jest.mock('state/ticket/selectors', () => ({
    getAppliedMacro: jest.fn(),
    getTicketFieldState: jest.fn(),
}))

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(() => ({
        data: {
            data: [{...mockTicketInputFieldDefinition, required: true}],
        },
        isLoading: false,
    })),
}))

const mockedUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)
const mockedTriggerTicketFieldsErrors = assumeMock(triggerTicketFieldsErrors)
const mockedGetAppliedMacro = assumeMock(getAppliedMacro)
const mockedGetTicketFieldState = assumeMock(getTicketFieldState)

// Data here is valid because the required field is provided by the macro
function mockValidData() {
    mockedGetAppliedMacro.mockImplementation(() =>
        mockMap({
            actions: [
                {
                    ...mockSetCustomFieldValueAction,
                    arguments: {
                        ...mockSetCustomFieldValueAction.arguments,
                        custom_field_id: mockTicketInputFieldDefinition.id,
                    },
                },
            ],
        })
    )
    mockedGetTicketFieldState.mockImplementation(() => ({
        [mockTicketInputFieldDefinition.id]: {
            id: mockTicketInputFieldDefinition.id,
            value: '',
        },
    }))
}

// Data here is invalid because the required field is not provided by the macro
function mockInvalidData() {
    mockedGetAppliedMacro.mockImplementation(() => {
        return mockMap({
            actions: [],
        })
    })
    mockedGetTicketFieldState.mockImplementation(() => ({
        [mockTicketInputFieldDefinition.id]: {
            id: mockTicketInputFieldDefinition.id,
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
        const {result} = renderHook(() => useTicketFieldsCheck(TICKET_ID))
        expect(mockedDispatch).not.toHaveBeenCalled()
        expect(
            result.current.checkTicketFieldErrors({includeMacro: true})
        ).toEqual(false)
    })

    it('should return ignore macro data if include macro is not set', () => {
        mockValidData()
        const {result} = renderHook(() => useTicketFieldsCheck(TICKET_ID))
        expect(mockedDispatch).not.toHaveBeenCalled()
        expect(result.current.checkTicketFieldErrors()).toEqual(true)
    })

    it('should return true if at least on ticket field is invalid and dispatch an action', () => {
        mockInvalidData()
        const {result} = renderHook(() => useTicketFieldsCheck(TICKET_ID))
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
                }) as unknown as ReturnType<typeof useCustomFieldDefinitions>
        )

        const {result} = renderHook(() => useTicketFieldsCheck(TICKET_ID))

        expect(
            result.current.checkTicketFieldErrors({includeMacro: true})
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
                }) as unknown as ReturnType<typeof useCustomFieldDefinitions>
        )

        const {result} = renderHook(() => useTicketFieldsCheck(TICKET_ID))

        expect(
            result.current.checkTicketFieldErrors({includeMacro: true})
        ).toEqual(false)
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
        expect(setHasAttemptedToCloseTicket).toHaveBeenCalledWith(false)
    })
})
