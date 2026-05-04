import type {
    SearchCallRow,
    SearchCustomerRow,
    SearchRow,
    SearchTicketRow,
} from '../../../types'
import {
    getAvailableSections,
    getRowHiddenMatch,
    getRowsForSection,
    getSectionTitle,
    hasDisplayTextValue,
    hasTextValue,
    stripRowHighlights,
    toRecentRows,
} from '../searchSpotlightUtils'

describe('searchSpotlightUtils', () => {
    it('detects whether display text and plain text values are present', () => {
        expect(hasDisplayTextValue({ text: '' })).toBe(false)
        expect(
            hasDisplayTextValue({
                text: '',
                highlightedHtml: '<em>Ada</em>',
            }),
        ).toBe(true)
        expect(hasTextValue('')).toBe(false)
        expect(hasTextValue('Ada')).toBe(true)
    })

    it('strips highlights from customer, ticket, and call rows', () => {
        const rows: SearchRow[] = [
            {
                kind: 'customer',
                id: 1,
                raw: { id: 1 },
                url: '/app/customer/1',
                name: { text: 'Ada', highlightedHtml: '<em>Ada</em>' },
                email: {
                    text: 'ada@example.com',
                    highlightedHtml: '<em>ada</em>',
                },
                phone: { text: '+331', highlightedHtml: '<em>+331</em>' },
            },
            {
                kind: 'ticket',
                id: 2,
                raw: { id: 2 },
                url: '/app/ticket/2',
                subject: { text: 'Refund', highlightedHtml: '<em>Refund</em>' },
                hiddenMatch: {
                    text: 'excerpt',
                    highlightedHtml: '<em>excerpt</em>',
                },
                customerName: {
                    text: 'Ada',
                    highlightedHtml: '<em>Ada</em>',
                },
                statusLabel: 'Open',
                statusColor: 'purple',
                isUnread: true,
                activityLabel: '',
                agentName: '',
            },
            {
                kind: 'call',
                id: 3,
                raw: { id: 3 },
                url: '/app/ticket/3?call_id=3',
                title: {
                    text: 'Incoming call',
                    highlightedHtml: '<em>Incoming</em> call',
                },
                hiddenMatch: {
                    text: 'transcript',
                    highlightedHtml: '<em>transcript</em>',
                },
                customerPhone: {
                    text: '+331',
                    highlightedHtml: '<em>+331</em>',
                },
                statusLabel: 'Answered',
                statusColor: 'green',
                callIcon: 'comm-phone-incoming',
                activityLabel: '',
            },
        ]

        const [customer, ticket, call] = rows.map(stripRowHighlights) as [
            SearchCustomerRow,
            SearchTicketRow,
            SearchCallRow,
        ]

        expect(customer.name).toEqual({ text: 'Ada' })
        expect(ticket.subject).toEqual({ text: 'Refund' })
        expect(ticket.hiddenMatch).toBeUndefined()
        expect(call.title).toEqual({ text: 'Incoming call' })
        expect(call.hiddenMatch).toBeUndefined()
    })

    it('returns hidden matches only for non-customer rows', () => {
        expect(
            getRowHiddenMatch({
                kind: 'customer',
                id: 1,
                raw: { id: 1 },
                url: '/app/customer/1',
                name: { text: 'Ada' },
                email: { text: '' },
                phone: { text: '' },
            }),
        ).toBeUndefined()

        expect(
            getRowHiddenMatch({
                kind: 'ticket',
                id: 2,
                raw: { id: 2 },
                url: '/app/ticket/2',
                subject: { text: 'Refund' },
                hiddenMatch: { text: 'excerpt' },
                customerName: { text: 'Ada' },
                statusLabel: 'Open',
                statusColor: 'purple',
                isUnread: true,
                activityLabel: '',
                agentName: '',
            }),
        ).toEqual({ text: 'excerpt' })
    })

    it('returns the available sections and section titles', () => {
        expect(getAvailableSections(true)).toEqual([
            'all',
            'customers',
            'tickets',
            'calls',
        ])
        expect(getAvailableSections(false)).toEqual([
            'all',
            'customers',
            'tickets',
        ])
        expect(getSectionTitle('customers', false)).toBe(
            'Recently accessed customers',
        )
        expect(getSectionTitle('tickets', true)).toBe('Tickets')
    })

    it('limits grouped rows and filters null recent rows', () => {
        const rows = [
            { kind: 'customer', id: 1 },
            { kind: 'customer', id: 2 },
            { kind: 'customer', id: 3 },
            { kind: 'customer', id: 4 },
        ] as SearchRow[]

        expect(getRowsForSection(rows, true)).toHaveLength(3)
        expect(getRowsForSection(rows, false)).toHaveLength(4)
        expect(
            toRecentRows([{ id: 1 }, { id: 2 }, { id: 3 }], (value) =>
                value.id === 2
                    ? null
                    : ({
                          kind: 'customer',
                          id: value.id,
                          raw: value,
                          url: `/app/customer/${value.id}`,
                          name: { text: `Customer #${value.id}` },
                          email: { text: '' },
                          phone: { text: '' },
                      } as SearchRow),
            ),
        ).toEqual([
            {
                kind: 'customer',
                id: 1,
                raw: { id: 1 },
                url: '/app/customer/1',
                name: { text: 'Customer #1' },
                email: { text: '' },
                phone: { text: '' },
            },
            {
                kind: 'customer',
                id: 3,
                raw: { id: 3 },
                url: '/app/customer/3',
                name: { text: 'Customer #3' },
                email: { text: '' },
                phone: { text: '' },
            },
        ])
    })
})
