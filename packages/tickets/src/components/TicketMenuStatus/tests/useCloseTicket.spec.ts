import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUpdateTicket } from '@gorgias/helpdesk-queries'

import * as useTicketViewNavigationModule from '../../../hooks/useTicketViewNavigation'
import { renderHook } from '../../../tests/render.utils'
import * as useTicketFieldsValidationModule from '../../InfobarTicketDetails/components/InfobarTicketFields/hooks/useTicketFieldsValidation'
import { useCloseTicket } from '../useCloseTicket'
import { TicketStatus } from '../utils'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual('@gorgias/helpdesk-queries')
    return {
        ...actual,
        useUpdateTicket: vi.fn(),
        queryKeys: {
            views: {
                all: vi.fn(() => ['views']),
            },
            tickets: {
                getTicket: vi.fn(() => ['tickets', 'detail']),
            },
        },
    }
})

vi.mock(
    '../../InfobarTicketDetails/components/InfobarTicketFields/hooks/useTicketFieldsValidation',
)

vi.mock('../../../hooks/useTicketViewNavigation')

const mockUseUpdateTicket = vi.mocked(useUpdateTicket)

describe('useCloseTicket', () => {
    const ticketId = 123
    const mockMutateAsyncUpdateTicket = vi.fn()
    const mockValidateTicketFields = vi.fn()
    const mockHandleGoToNextViewTicket = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseUpdateTicket.mockReturnValue({
            mutateAsync: mockMutateAsyncUpdateTicket,
        } as any)

        vi.spyOn(
            useTicketViewNavigationModule,
            'useTicketViewNavigation',
        ).mockReturnValue({
            handleGoToNextViewTicket: mockHandleGoToNextViewTicket,
        } as any)
    })

    it('should close ticket when validation passes', async () => {
        mockValidateTicketFields.mockReturnValue({
            hasErrors: false,
            invalidFieldIds: [],
        })

        vi.spyOn(
            useTicketFieldsValidationModule,
            'useTicketFieldsValidation',
        ).mockReturnValue({
            validateTicketFields: mockValidateTicketFields,
            isValidating: false,
        })

        const { result } = renderHook(() => useCloseTicket(ticketId))

        await result.current.closeTicket()

        expect(mockValidateTicketFields).toHaveBeenCalledTimes(1)
        expect(mockMutateAsyncUpdateTicket).toHaveBeenCalledWith({
            id: ticketId,
            data: { status: TicketStatus.Closed, snooze_datetime: null },
        })
    })

    it('should not close ticket when validation fails', async () => {
        mockValidateTicketFields.mockReturnValue({
            hasErrors: true,
            invalidFieldIds: [1, 2],
        })

        vi.spyOn(
            useTicketFieldsValidationModule,
            'useTicketFieldsValidation',
        ).mockReturnValue({
            validateTicketFields: mockValidateTicketFields,
            isValidating: false,
        })

        const { result } = renderHook(() => useCloseTicket(ticketId))

        await result.current.closeTicket()

        expect(mockValidateTicketFields).toHaveBeenCalledTimes(1)
        expect(mockMutateAsyncUpdateTicket).not.toHaveBeenCalled()
    })

    it('should trigger validation before attempting to close', async () => {
        mockValidateTicketFields.mockReturnValue({
            hasErrors: false,
            invalidFieldIds: [],
        })

        vi.spyOn(
            useTicketFieldsValidationModule,
            'useTicketFieldsValidation',
        ).mockReturnValue({
            validateTicketFields: mockValidateTicketFields,
            isValidating: false,
        })

        const { result } = renderHook(() => useCloseTicket(ticketId))

        await result.current.closeTicket()

        expect(mockValidateTicketFields).toHaveBeenCalledBefore(
            mockMutateAsyncUpdateTicket,
        )
    })

    it('should expose isValidating flag from validation hook', () => {
        mockValidateTicketFields.mockReturnValue({
            hasErrors: false,
            invalidFieldIds: [],
        })

        vi.spyOn(
            useTicketFieldsValidationModule,
            'useTicketFieldsValidation',
        ).mockReturnValue({
            validateTicketFields: mockValidateTicketFields,
            isValidating: true,
        })

        const { result } = renderHook(() => useCloseTicket(ticketId))

        expect(result.current.isValidating).toBe(true)
    })

    it('should close a snoozed ticket by setting status to closed and clearing snooze_datetime', async () => {
        mockValidateTicketFields.mockReturnValue({
            hasErrors: false,
            invalidFieldIds: [],
        })
        mockMutateAsyncUpdateTicket.mockResolvedValue(undefined)

        vi.spyOn(
            useTicketFieldsValidationModule,
            'useTicketFieldsValidation',
        ).mockReturnValue({
            validateTicketFields: mockValidateTicketFields,
            isValidating: false,
        })

        const { result } = renderHook(() => useCloseTicket(ticketId))

        await result.current.closeTicket()

        expect(mockMutateAsyncUpdateTicket).toHaveBeenCalledWith({
            id: ticketId,
            data: {
                status: TicketStatus.Closed,
                snooze_datetime: null,
            },
        })
        expect(mockHandleGoToNextViewTicket).toHaveBeenCalledTimes(1)
    })

    it('should not throw error when closing ticket with validation passing', async () => {
        mockValidateTicketFields.mockReturnValue({
            hasErrors: false,
            invalidFieldIds: [],
        })
        mockMutateAsyncUpdateTicket.mockResolvedValue(undefined)

        vi.spyOn(
            useTicketFieldsValidationModule,
            'useTicketFieldsValidation',
        ).mockReturnValue({
            validateTicketFields: mockValidateTicketFields,
            isValidating: false,
        })

        const { result } = renderHook(() => useCloseTicket(ticketId))

        await expect(result.current.closeTicket()).resolves.not.toThrow()
    })
})
