import normalizeUserName from './normalizeUserName'

describe('normalizeUserName', () => {
    it('should remove emojis from the name', () => {
        expect(normalizeUserName('John 😀 Doe')).toBe('John Doe')
        expect(normalizeUserName('Test🎉User')).toBe('TestUser')
        expect(normalizeUserName('👋Hello👋')).toBe('Hello')
    })

    it('should normalize multiple consecutive spaces to a single space', () => {
        expect(normalizeUserName('John   Doe')).toBe('John Doe')
        expect(normalizeUserName('Test    User')).toBe('Test User')
        expect(normalizeUserName('A     B     C')).toBe('A B C')
    })

    it('should preserve accented characters', () => {
        expect(normalizeUserName('José')).toBe('José')
        expect(normalizeUserName('Müller')).toBe('Müller')
        expect(normalizeUserName('Café')).toBe('Café')
        expect(normalizeUserName('François')).toBe('François')
        expect(normalizeUserName('Øyvind')).toBe('Øyvind')
    })

    it('should handle combined cases: emojis, spaces, and accented characters', () => {
        expect(normalizeUserName('José   😀   Müller')).toBe('José Müller')
        expect(normalizeUserName('Café🎉   Ramirez👋')).toBe('Café Ramirez')
        expect(normalizeUserName('François  🚀  Dubois')).toBe(
            'François Dubois',
        )
    })

    it('should handle trailing and leading spaces', () => {
        expect(normalizeUserName('  John')).toBe('John')
        expect(normalizeUserName('John  ')).toBe('John')
        expect(normalizeUserName('  John  ')).toBe('John')
        expect(normalizeUserName('   John   Doe   ')).toBe('John Doe')
    })

    it('should handle edge cases', () => {
        expect(normalizeUserName('')).toBe('')
        expect(normalizeUserName('   ')).toBe('')
        expect(normalizeUserName('😀')).toBe('')
        expect(normalizeUserName('John')).toBe('John')
    })

    it('should handle tabs and newlines as spaces', () => {
        expect(normalizeUserName('John\t\tDoe')).toBe('John Doe')
        expect(normalizeUserName('John\n\nDoe')).toBe('John Doe')
        expect(normalizeUserName('John \t \n Doe')).toBe('John Doe')
    })
})
