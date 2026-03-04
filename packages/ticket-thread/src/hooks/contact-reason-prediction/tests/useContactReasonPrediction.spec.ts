import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockGetTicketHandler, mockTicket } from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketThreadItemTag } from '../../types'
import { useContactReasonPrediction } from '../useContactReasonPrediction'

function createTicketWithCustomFields(ticketId: number, customFields: any) {
    const ticket = mockTicket({
        id: ticketId,
    } as any)

    return {
        ...ticket,
        custom_fields: customFields,
    } as any
}

describe('useContactReasonPrediction', () => {
    it('prepends one suggestion item per displayable prediction', async () => {
        const ticketId = 1123
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(
                createTicketWithCustomFields(ticketId, {
                    one: { prediction: { display: true } },
                    two: { prediction: { display: false } },
                    three: { prediction: { display: true } },
                }),
            ),
        )
        const waitForGetTicketRequest = mockGetTicket.waitForRequest(server)

        server.use(mockGetTicket.handler)

        const { result } = renderHook(() =>
            useContactReasonPrediction({ ticketId }),
        )
        const items = [
            {
                _tag: 'message',
                data: { id: 1 },
                datetime: '2024-03-21T11:00:00Z',
            } as any,
        ]

        await waitForGetTicketRequest(() => undefined)
        await waitFor(() => {
            expect(
                result.current.insertContactReasonPrediction(items),
            ).toHaveLength(3)
        })

        const updatedItems = result.current.insertContactReasonPrediction(items)

        expect(updatedItems.slice(0, 2).map((item) => item._tag)).toEqual([
            TicketThreadItemTag.ContactReasonSuggestion,
            TicketThreadItemTag.ContactReasonSuggestion,
        ])
    })

    it('does not modify items when no prediction should be shown', async () => {
        const ticketId = 1124
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(
                createTicketWithCustomFields(ticketId, {
                    one: { prediction: { display: false } },
                }),
            ),
        )
        const waitForGetTicketRequest = mockGetTicket.waitForRequest(server)

        server.use(mockGetTicket.handler)

        const { result } = renderHook(() =>
            useContactReasonPrediction({ ticketId }),
        )
        const items = [{ _tag: 'message', data: { id: 1 } } as any]

        await waitForGetTicketRequest(() => undefined)

        expect(result.current.insertContactReasonPrediction(items)).toEqual(
            items,
        )
    })
})
