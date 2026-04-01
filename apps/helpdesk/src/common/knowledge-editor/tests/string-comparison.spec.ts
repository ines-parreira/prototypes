import { areTrimmedStringsEqual } from '../utils/string-comparison'

describe('areTrimmedStringsEqual', () => {
    it('returns true for identical strings', () => {
        expect(areTrimmedStringsEqual('hello', 'hello')).toBe(true)
    })

    it('returns true for strings with only trailing whitespace difference', () => {
        expect(areTrimmedStringsEqual('hello', 'hello   ')).toBe(true)
    })

    it('returns true for strings with only leading whitespace difference', () => {
        expect(areTrimmedStringsEqual('   hello', 'hello')).toBe(true)
    })

    it('returns true for strings with both leading and trailing whitespace', () => {
        expect(areTrimmedStringsEqual('   hello   ', 'hello')).toBe(true)
    })

    it('returns false for different strings', () => {
        expect(areTrimmedStringsEqual('hello', 'world')).toBe(false)
    })

    it('returns true for empty strings', () => {
        expect(areTrimmedStringsEqual('', '')).toBe(true)
    })

    it('returns true for whitespace-only strings', () => {
        expect(areTrimmedStringsEqual('   ', '  ')).toBe(true)
    })
})
