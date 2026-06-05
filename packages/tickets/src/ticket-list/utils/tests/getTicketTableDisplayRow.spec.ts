import {
    mockTicketCompact,
    mockTicketTranslationCompact,
} from '@gorgias/helpdesk-mocks'

import type { SearchTicket } from '../../types/search'
import { getTicketTableDisplayRow } from '../getTicketTableDisplayRow'

describe('getTicketTableDisplayRow', () => {
    it('keeps a subject highlight when it contains a real match', () => {
        const ticket = {
            ...mockTicketCompact({
                id: 1,
                subject: 'Original subject',
            }),
            highlights: {
                subject: ['<em>Matched</em> subject'],
            },
        } as SearchTicket

        const translation = mockTicketTranslationCompact({
            ticket_id: 1,
            subject: 'Translated subject',
        })

        const displayRow = getTicketTableDisplayRow({
            ticket,
            translation,
            showTranslatedContent: true,
        })

        expect(displayRow.subject).toEqual({
            text: 'Translated subject',
            highlightedHtml: '<em>Matched</em> subject',
        })
    })

    it('drops a subject highlight when it has no match markup', () => {
        const ticket = {
            ...mockTicketCompact({
                id: 1,
                subject: 'Original subject',
            }),
            highlights: {
                subject: ['Matched subject'],
            },
        } as SearchTicket

        const translation = mockTicketTranslationCompact({
            ticket_id: 1,
            subject: 'Translated subject',
        })

        const displayRow = getTicketTableDisplayRow({
            ticket,
            translation,
            showTranslatedContent: true,
        })

        expect(displayRow.subject).toEqual({
            text: 'Translated subject',
            highlightedHtml: null,
        })
    })

    it('drops an excerpt highlight when it is missing', () => {
        const ticket = mockTicketCompact({
            id: 1,
            excerpt: 'Original excerpt',
        })
        const translation = mockTicketTranslationCompact({
            ticket_id: 1,
            excerpt: 'Translated excerpt',
        })

        const displayRow = getTicketTableDisplayRow({
            ticket,
            translation,
            showTranslatedContent: true,
        })

        expect(displayRow.excerpt).toEqual({
            text: 'Translated excerpt',
            highlightedHtml: null,
        })
    })

    it('strips HTML from subject and excerpt text when there are no search highlights', () => {
        const ticket = mockTicketCompact({
            id: 1,
            subject: '<b>Urgent</b> request',
            excerpt: '<div>Please <em>help</em> me</div>',
        })

        const displayRow = getTicketTableDisplayRow({ ticket })

        expect(displayRow.subject.text).toBe('Urgent request')
        expect(displayRow.excerpt.text).toBe('Please help me')
    })
})
