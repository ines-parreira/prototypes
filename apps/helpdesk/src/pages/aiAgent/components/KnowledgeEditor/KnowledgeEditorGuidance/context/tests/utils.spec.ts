import { areTrimmedStringsEqual } from 'pages/aiAgent/components/KnowledgeEditor/shared/utils'

describe('areTrimmedStringsEqual', () => {
    it('should return true for identical strings', () => {
        expect(areTrimmedStringsEqual('hello', 'hello')).toBe(true)
    })

    it('should return true for strings with only trailing whitespace difference', () => {
        expect(areTrimmedStringsEqual('hello', 'hello   ')).toBe(true)
    })

    it('should return true for strings with only leading whitespace difference', () => {
        expect(areTrimmedStringsEqual('   hello', 'hello')).toBe(true)
    })

    it('should return true for strings with both leading and trailing whitespace', () => {
        expect(areTrimmedStringsEqual('   hello   ', 'hello')).toBe(true)
    })

    it('should return false for different strings', () => {
        expect(areTrimmedStringsEqual('hello', 'world')).toBe(false)
    })

    it('should return false for strings with different content despite whitespace', () => {
        expect(areTrimmedStringsEqual('hello   ', 'world')).toBe(false)
    })

    it('should return true for empty strings', () => {
        expect(areTrimmedStringsEqual('', '')).toBe(true)
    })

    it('should return true for whitespace-only strings compared to empty', () => {
        expect(areTrimmedStringsEqual('   ', '')).toBe(true)
    })

    it('should preserve mid-string whitespace differences', () => {
        expect(areTrimmedStringsEqual('hello  world', 'hello world')).toBe(
            false,
        )
    })
})
