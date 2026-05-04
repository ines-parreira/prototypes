import { describe, expect, it } from 'vitest'

import { toCallRow, toTicketRow } from './utils'

describe('search spotlight row adapters', () => {
    it('maps legacy ticket customer and excerpt highlights', () => {
        const row = toTicketRow({
            id: 202,
            subject: 'Refund request',
            excerpt: 'Original excerpt',
            status: 'open',
            is_unread: true,
            customer: {
                id: 101,
                name: 'Ada Lovelace',
            },
            highlights: {
                messages: {
                    from: {
                        name: ['<em>Ada</em> Lovelace'],
                    },
                    body: ['Original <em>excerpt</em>'],
                },
            },
        })

        expect(row).not.toBeNull()
        expect(row?.customerName.highlightedHtml).toBe('<em>Ada</em> Lovelace')
        expect(row?.hiddenMatch?.highlightedHtml).toBe(
            'Original <em>excerpt</em>',
        )
    })

    it('maps call transcript highlights into the hidden match row', () => {
        const row = toCallRow({
            id: 303,
            ticket_id: 202,
            direction: 'inbound',
            status: 'answered',
            phone_number_source: '+3311111111',
            transcript: 'Customer mentioned refund',
            highlights: {
                transcripts: ['Customer mentioned <em>refund</em>'],
            },
        })

        expect(row).not.toBeNull()
        expect(row?.hiddenMatch?.highlightedHtml).toBe(
            'Customer mentioned <em>refund</em>',
        )
    })
})
