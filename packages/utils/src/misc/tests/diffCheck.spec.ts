import { Diff, diffChars } from '../diffCheck'

describe('Diff', () => {
    let diffInstance: Diff

    beforeEach(() => {
        diffInstance = new Diff()
    })

    it('should return added: false and remove: false for identical strings', () => {
        const oldStr = 'hello'
        const newStr = 'hello'
        const result = diffInstance.diff(oldStr, newStr)
        expect(result).toEqual([
            { count: 5, added: false, removed: false, value: 'hello' },
        ])
    })

    it('should detect added characters', () => {
        const oldStr = 'hello'
        const newStr = 'hello world'
        const result = diffInstance.diff(oldStr, newStr)
        expect(result).toEqual([
            { count: 5, added: false, removed: false, value: 'hello' },
            { count: 6, added: true, removed: false, value: ' world' },
        ])
    })

    it('should detect removed characters', () => {
        const oldStr = 'hello world'
        const newStr = 'hello'
        const result = diffInstance.diff(oldStr, newStr)
        expect(result).toEqual([
            { count: 5, added: false, removed: false, value: 'hello' },
            { count: 6, added: false, removed: true, value: ' world' },
        ])
    })

    it('should detect changed characters', () => {
        const oldStr = 'hello'
        const newStr = 'hallo'
        const result = diffInstance.diff(oldStr, newStr)
        expect(result).toEqual([
            { count: 1, added: false, removed: false, value: 'h' },
            { count: 1, added: false, removed: true, value: 'e' },
            { count: 1, added: true, removed: false, value: 'a' },
            { count: 3, added: false, removed: false, value: 'llo' },
        ])
    })

    it('should respect ignoreCase option', () => {
        const oldStr = 'Hello'
        const newStr = 'hello'
        const result = diffInstance.diff(oldStr, newStr, { ignoreCase: true })
        expect(result).toEqual([
            { count: 5, added: false, removed: false, value: 'hello' },
        ])
    })

    it('should respect maxEditLength option', () => {
        const oldStr = 'hello'
        const newStr = 'hello world'
        const result = diffInstance.diff(oldStr, newStr, { maxEditLength: 5 })
        expect(result).toBeUndefined()
    })

    it('should respect timeout option', () => {
        const oldStr = 'a'.repeat(10000)
        const newStr = 'b'.repeat(10000)
        const result = diffInstance.diff(oldStr, newStr, { timeout: 1 })
        expect(result).toBeUndefined()
    })

    it('diffChars function should work correctly', () => {
        const oldStr = 'hello'
        const newStr = 'hello world'
        const result = diffChars(oldStr, newStr, {})
        expect(result).toEqual([
            { count: 5, added: false, removed: false, value: 'hello' },
            { count: 6, added: true, removed: false, value: ' world' },
        ])
    })
})
