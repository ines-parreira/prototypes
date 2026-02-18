import { isTimedelta } from '../ast'

describe('ast util', () => {
    describe('isTimedelta', () => {
        it('should return false if data is not a string', () => {
            expect(isTimedelta(undefined)).toBe(false)
            expect(isTimedelta(null)).toBe(false)
            expect(isTimedelta(1)).toBe(false)
            expect(isTimedelta({ foo: 'bar' })).toBe(false)
        })

        it('should return false if data does not match the regex (raw=false)', () => {
            expect(isTimedelta('d1')).toBe(false)
            expect(isTimedelta('1d1')).toBe(false)
            expect(isTimedelta('d1d')).toBe(false)
            expect(isTimedelta('1.d')).toBe(false)
            expect(isTimedelta("'1d'")).toBe(false)
        })

        it('should return false if data does not match the regex (raw=true)', () => {
            expect(isTimedelta("'d1'", true)).toBe(false)
            expect(isTimedelta("'1d1'", true)).toBe(false)
            expect(isTimedelta("'d1d'", true)).toBe(false)
            expect(isTimedelta('1d', true)).toBe(false)
        })

        it('should return true if data matches the regex (raw=false)', () => {
            expect(isTimedelta('1d')).toBe(true)
            expect(isTimedelta('2m')).toBe(true)
            expect(isTimedelta('3w')).toBe(true)
            expect(isTimedelta('5h')).toBe(true)
            expect(isTimedelta('123456789w')).toBe(true)
        })

        it('should return true if data matches the regex (raw=true)', () => {
            expect(isTimedelta("'1d'", true)).toBe(true)
            expect(isTimedelta("'2m'", true)).toBe(true)
            expect(isTimedelta("'3w'", true)).toBe(true)
            expect(isTimedelta("'5h'", true)).toBe(true)
            expect(isTimedelta("'123456789w'", true)).toBe(true)
        })
    })
})
