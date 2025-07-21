import sum from '../sum'

describe('sum', () => {
    it('should add all the given numbers', () => {
        const result = sum([1, 2, 3, 4])
        expect(result).toBe(10)
    })
})
