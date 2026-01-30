import { areTrimmedStringsEqual } from './utils'

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

    it('returns false for strings with different content despite whitespace', () => {
        expect(areTrimmedStringsEqual('hello   ', 'world')).toBe(false)
    })

    it('returns true for empty strings', () => {
        expect(areTrimmedStringsEqual('', '')).toBe(true)
    })

    it('returns true for whitespace-only strings', () => {
        expect(areTrimmedStringsEqual('   ', '  ')).toBe(true)
    })

    it('returns true for empty string and whitespace-only string', () => {
        expect(areTrimmedStringsEqual('', '   ')).toBe(true)
    })

    it('returns false when content differs in middle', () => {
        expect(areTrimmedStringsEqual('hello world', 'hello  world')).toBe(
            false,
        )
    })
})
