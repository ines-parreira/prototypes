import { getCursorFromItemsUrl, getNextCursorFromMeta } from '../cursors'

describe('getCursorFromItemsUrl', () => {
    it.each([
        ['undefined', undefined, undefined],
        ['null', null, undefined],
        ['no query string', '/api/views/1/items/', undefined],
        [
            'no cursor param',
            '/api/views/1/items/?limit=25&order_by=id',
            undefined,
        ],
        [
            'cursor in query string',
            '/api/views/1/items/?cursor=abc123&limit=25',
            'abc123',
        ],
        [
            'cursor with hash fragment',
            '/api/views/1/items/?cursor=abc123#section',
            'abc123',
        ],
    ])('returns correct cursor for %s', (_, input, expected) => {
        expect(getCursorFromItemsUrl(input)).toBe(expected)
    })
})

describe('getNextCursorFromMeta', () => {
    it.each([
        ['undefined', undefined, undefined],
        ['null', null, undefined],
        ['empty meta', {}, undefined],
        ['null next_items', { next_items: null }, undefined],
        [
            'next_items with cursor',
            { next_items: '/api/views/1/items/?cursor=xyz789&limit=25' },
            'xyz789',
        ],
        [
            'next_items without cursor',
            { next_items: '/api/views/1/items/?limit=25' },
            undefined,
        ],
    ])('returns correct cursor for %s', (_, input, expected) => {
        expect(getNextCursorFromMeta(input)).toBe(expected)
    })
})
