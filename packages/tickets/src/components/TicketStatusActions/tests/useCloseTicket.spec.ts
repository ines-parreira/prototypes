import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import { HttpResponse } from 'msw'

import {
    mockUpdateTicketHandler,
    mockUpdateTicketResponse,
} from '@gorgias/helpdesk-mocks'

import * as useTicketViewNavigationModule from '../../../hooks/useTicketViewNavigation'
import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import * as useTicketFieldsValidationModule from '../../InfobarTicketDetails/components/InfobarTicketFields/hooks/useTicketFieldsValidation'
import { useCloseTicket } from '../useCloseTicket'
import { TicketStatus } from '../utils'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

vi.mock(
    '../../InfobarTicketDetails/components/InfobarTicketFields/hooks/useTicketFieldsValidation',
)

vi.mock('../../../hooks/useTicketViewNavigation')

describe('useCloseTicket', () => {
    const ticketId = 123
    const mockValidateTicketFields = vi.fn()
    const mockHandleGoToNextViewTicket = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        server.use(
            mockUpdateTicketHandler(async () =>
                HttpResponse.json(mockUpdateTicketResponse()),
            ).handler,
        )

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
        const updateTicketMock = mockUpdateTicketHandler(async () =>
            HttpResponse.json(mockUpdateTicketResponse()),
        )
        const waitForUpdateTicketRequest =
            updateTicketMock.waitForRequest(server)
        server.use(updateTicketMock.handler)

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
        await waitForUpdateTicketRequest(async (request) => {
            expect(new URL(request.url).pathname).toBe(
                `/api/tickets/${ticketId}`,
            )
            await expect(request.json()).resolves.toEqual({
                status: TicketStatus.Closed,
                snooze_datetime: null,
            })
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
    })

    it('should trigger validation before attempting to close', async () => {
        const events: string[] = []
        mockValidateTicketFields.mockReturnValue({
            hasErrors: false,
            invalidFieldIds: [],
        })
        mockValidateTicketFields.mockImplementation(() => {
            events.push('validate')

            return {
                hasErrors: false,
                invalidFieldIds: [],
            }
        })
        const updateTicketMock = mockUpdateTicketHandler(async () => {
            events.push('update')

            return HttpResponse.json(mockUpdateTicketResponse())
        })
        server.use(updateTicketMock.handler)

        vi.spyOn(
            useTicketFieldsValidationModule,
            'useTicketFieldsValidation',
        ).mockReturnValue({
            validateTicketFields: mockValidateTicketFields,
            isValidating: false,
        })

        const { result } = renderHook(() => useCloseTicket(ticketId))

        await result.current.closeTicket()

        expect(events).toEqual(['validate', 'update'])
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
        const updateTicketMock = mockUpdateTicketHandler(async () =>
            HttpResponse.json(mockUpdateTicketResponse()),
        )
        const waitForUpdateTicketRequest =
            updateTicketMock.waitForRequest(server)
        server.use(updateTicketMock.handler)

        vi.spyOn(
            useTicketFieldsValidationModule,
            'useTicketFieldsValidation',
        ).mockReturnValue({
            validateTicketFields: mockValidateTicketFields,
            isValidating: false,
        })

        const { result } = renderHook(() => useCloseTicket(ticketId))

        await result.current.closeTicket()

        await waitForUpdateTicketRequest(async (request) => {
            await expect(request.json()).resolves.toEqual({
                status: TicketStatus.Closed,
                snooze_datetime: null,
            })
        })
        expect(mockHandleGoToNextViewTicket).toHaveBeenCalledTimes(1)
    })

    it('should not throw error when closing ticket with validation passing', async () => {
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

        await expect(result.current.closeTicket()).resolves.not.toThrow()
    })
})
