import {
    parseSearchOptionalString,
    parseSearchString,
    TicketSearchParamsKeys,
} from './TicketSearchParamsKeys'

describe('TicketSearchParamsKeys', () => {
    it('parses search strings with an empty-string fallback', () => {
        expect(parseSearchString('hello')).toBe('hello')
        expect(parseSearchString('')).toBe('')
        expect(parseSearchString(null)).toBe('')
    })

    it('parses optional search strings with an undefined fallback', () => {
        expect(parseSearchOptionalString('next-page')).toBe('next-page')
        expect(parseSearchOptionalString('')).toBe('')
        expect(parseSearchOptionalString(null)).toBeUndefined()
    })

    it('parses the query param with empty-string fallback', () => {
        expect(TicketSearchParamsKeys.query.parse('hello')).toBe('hello')
        expect(TicketSearchParamsKeys.query.parse(null)).toBe('')
    })

    it('parses the filters param with empty-string fallback', () => {
        expect(TicketSearchParamsKeys.filters.parse('status:open')).toBe(
            'status:open',
        )
        expect(TicketSearchParamsKeys.filters.parse(null)).toBe('')
    })

    it('parses the cursor as an optional string', () => {
        expect(TicketSearchParamsKeys.cursor.parse('next-page')).toBe(
            'next-page',
        )
        expect(TicketSearchParamsKeys.cursor.parse('')).toBe('')
        expect(TicketSearchParamsKeys.cursor.parse(null)).toBeUndefined()
    })

    it('parses the ticket events flag using zod coercion', () => {
        expect(TicketSearchParamsKeys.showTicketEvents.parse('true')).toBe(true)
        expect(TicketSearchParamsKeys.showTicketEvents.parse('1')).toBe(true)
        expect(TicketSearchParamsKeys.showTicketEvents.parse('')).toBe(false)
        expect(TicketSearchParamsKeys.showTicketEvents.parse(null)).toBe(false)
    })

    it('parses the quick replies flag using zod coercion', () => {
        expect(
            TicketSearchParamsKeys.showTicketQuickReplies.parse('true'),
        ).toBe(true)
        expect(TicketSearchParamsKeys.showTicketQuickReplies.parse('0')).toBe(
            true,
        )
        expect(TicketSearchParamsKeys.showTicketQuickReplies.parse('')).toBe(
            false,
        )
        expect(TicketSearchParamsKeys.showTicketQuickReplies.parse(null)).toBe(
            false,
        )
    })
})
