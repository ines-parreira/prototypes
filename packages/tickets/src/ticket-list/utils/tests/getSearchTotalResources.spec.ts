import { getSearchTotalResources } from '../getSearchTotalResources'

describe('getSearchTotalResources', () => {
    it('returns undefined when meta is undefined', () => {
        expect(getSearchTotalResources(undefined)).toBeUndefined()
    })

    it('returns undefined when meta is not an object', () => {
        expect(getSearchTotalResources('invalid-meta' as never)).toBeUndefined()
    })

    it('returns undefined when total_resources is missing', () => {
        expect(
            getSearchTotalResources({
                next_cursor: null,
                prev_cursor: null,
            }),
        ).toBeUndefined()
    })

    it('returns undefined when total_resources is null', () => {
        expect(
            getSearchTotalResources({
                next_cursor: null,
                prev_cursor: null,
                total_resources: null,
            } as never),
        ).toBeUndefined()
    })

    it('returns undefined when total_resources is not a number', () => {
        expect(
            getSearchTotalResources({
                next_cursor: null,
                prev_cursor: null,
                total_resources: '5000',
            } as never),
        ).toBeUndefined()
    })

    it('returns total_resources when it is a number', () => {
        expect(
            getSearchTotalResources({
                next_cursor: null,
                prev_cursor: null,
                total_resources: 5000,
            } as never),
        ).toBe(5000)
    })
})
