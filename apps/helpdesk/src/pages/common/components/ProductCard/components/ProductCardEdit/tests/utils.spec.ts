import { getMinRangeSize } from '../utils'

describe('ProductCardEdit utils', () => {
    describe('getMinRangeSize()', () => {
        it.each([
            { image: undefined },
            { image: { width: 100 } },
            { image: { height: 300 } },
        ])('returns 1 for invalid configurations', ({ image }) => {
            const result = getMinRangeSize(image as any, {
                width: 10,
                height: 10,
            })
            expect(result).toEqual(1)
        })

        it('returns a correct minimum scale range', () => {
            const result = getMinRangeSize(
                { width: 500, height: 300 },
                { width: 100, height: 100 },
            )
            expect(result).toEqual(34)
        })
    })
})
