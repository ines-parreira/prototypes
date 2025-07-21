import { isUserSearchResult } from 'models/search/types'

describe('isUserSearchResult()', () => {
    it('returns true for valid customer search result', () => {
        expect(
            isUserSearchResult({
                id: 1,
                address: 'test',
                customer: {
                    id: 1,
                    name: 'alice',
                },
            }),
        ).toEqual(true)
    })

    it('returns false for invalid customer search result', () => {
        expect(isUserSearchResult('')).toEqual(false)
        expect(isUserSearchResult(null)).toEqual(false)
        expect(isUserSearchResult(undefined)).toEqual(false)
        expect(
            isUserSearchResult({
                id: 1,
                address: 2,
                customer: 3,
            }),
        ).toEqual(false)
    })
})
