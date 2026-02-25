import { renderHook } from '@testing-library/react'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { TicketThreadItemTag } from '../../types'
import { useContactReasonPrediction } from '../useContactReasonPrediction'

vi.mock('@gorgias/helpdesk-queries', () => ({
    useGetTicket: vi.fn(),
}))

const mockUseGetTicket = vi.mocked(useGetTicket)

describe('useContactReasonPrediction', () => {
    it('prepends one suggestion item per displayable prediction', () => {
        mockUseGetTicket.mockReturnValue({
            data: {
                custom_fields: {
                    one: { prediction: { display: true } },
                    two: { prediction: { display: false } },
                    three: { prediction: { display: true } },
                },
            },
        } as any)

        const { result } = renderHook(() =>
            useContactReasonPrediction({ ticketId: 123 }),
        )
        const items = result.current.insertContactReasonPrediction([
            {
                _tag: 'message',
                data: { id: 1 },
                datetime: '2024-03-21T11:00:00Z',
            } as any,
        ])

        // Legacy parity: selectors#getBody inserts one contact-reason suggestion
        // per custom field with prediction.display === true, at the beginning.
        expect(items.slice(0, 2).map((item) => item._tag)).toEqual([
            TicketThreadItemTag.ContactReasonSuggestion,
            TicketThreadItemTag.ContactReasonSuggestion,
        ])
        expect(items).toHaveLength(3)
    })

    it('does not modify items when no prediction should be shown', () => {
        mockUseGetTicket.mockReturnValue({
            data: {
                custom_fields: {
                    one: { prediction: { display: false } },
                },
            },
        } as any)

        const { result } = renderHook(() =>
            useContactReasonPrediction({ ticketId: 123 }),
        )
        const items = [{ _tag: 'message', data: { id: 1 } } as any]

        expect(result.current.insertContactReasonPrediction(items)).toEqual(
            items,
        )
    })
})
