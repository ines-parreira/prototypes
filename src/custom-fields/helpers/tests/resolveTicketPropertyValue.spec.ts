import { ExpressionFieldSource } from '@gorgias/helpdesk-types'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import { ticket } from 'fixtures/ticket'
import { TicketStateWithoutImmutable } from 'state/ticket/types'

import resolveTicketPropertyValue, {
    SupportedTicketFields,
} from '../resolveTicketPropertyValue'

describe('resolveTicketPropertyValue', () => {
    const ticketState: TicketStateWithoutImmutable = {
        ...ticket,
        custom_fields: {
            1: { id: 1, value: 'customValue1' },
            2: { id: 2, value: 'customValue2' },
        },
        status: TicketStatus.Open,
        channel: TicketChannel.Email,
    }

    it('should return the value from the ticket for Ticket source', () => {
        expect(
            resolveTicketPropertyValue(
                ticketState,
                ExpressionFieldSource.Ticket,
                SupportedTicketFields.Channel,
            ),
        ).toBe(TicketChannel.Email)
    })

    it('should return the value from the ticket for Ticket source', () => {
        expect(
            resolveTicketPropertyValue(
                ticketState,
                ExpressionFieldSource.Ticket,
                SupportedTicketFields.Status,
            ),
        ).toBe(TicketStatus.Open)
    })

    it('should return the ticket field value for TicketCustomFields source', () => {
        expect(
            resolveTicketPropertyValue(
                ticketState,
                ExpressionFieldSource.TicketCustomFields,
                1,
            ),
        ).toBe('customValue1')
    })

    it('should return null for non-present TicketCustomFields field', () => {
        expect(
            resolveTicketPropertyValue(
                ticketState,
                ExpressionFieldSource.TicketCustomFields,
                44,
            ),
        ).toBeNull()
    })

    it('should throw an error for unsupported source', () => {
        expect(() => {
            resolveTicketPropertyValue(
                ticketState,
                'UnsupportedSource' as any,
                SupportedTicketFields.Status,
            )
        }).toThrow(
            'Unsupported source "UnsupportedSource" for given property "status".',
        )
    })

    it('should throw an error because TicketCustomFields object supports property resolution by numeric id only', () => {
        expect(() => {
            resolveTicketPropertyValue(
                ticketState,
                ExpressionFieldSource.TicketCustomFields,
                SupportedTicketFields.Status,
            )
        }).toThrow(
            'Unsupported source "TicketCustomFields" for given property "status".',
        )
    })
})
