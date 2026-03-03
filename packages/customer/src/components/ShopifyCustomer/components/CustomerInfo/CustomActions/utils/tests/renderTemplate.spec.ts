import { renderTemplate } from '../renderTemplate'

describe('renderTemplate', () => {
    it('returns empty string for empty template', () => {
        expect(renderTemplate('', {})).toBe('')
    })

    it('returns template unchanged when no variables present', () => {
        expect(renderTemplate('hello world', {})).toBe('hello world')
    })

    it('replaces a simple variable', () => {
        expect(renderTemplate('Hello {{name}}', { name: 'Alice' })).toBe(
            'Hello Alice',
        )
    })

    it('replaces multiple variables', () => {
        expect(
            renderTemplate('{{greeting}}, {{name}}!', {
                greeting: 'Hi',
                name: 'Bob',
            }),
        ).toBe('Hi, Bob!')
    })

    it('resolves nested paths', () => {
        expect(
            renderTemplate('{{customer.name}}', {
                customer: { name: 'Charlie' },
            }),
        ).toBe('Charlie')
    })

    it('resolves array indices', () => {
        expect(
            renderTemplate('{{items[0]}}', { items: ['first', 'second'] }),
        ).toBe('first')
    })

    it('returns empty string for missing variables', () => {
        expect(renderTemplate('{{missing}}', {})).toBe('')
    })

    it('returns empty string for null values', () => {
        expect(renderTemplate('{{val}}', { val: null })).toBe('')
    })

    it('converts numbers to string', () => {
        expect(renderTemplate('Total: {{amount}}', { amount: 42 })).toBe(
            'Total: 42',
        )
    })

    it('handles deeply nested paths', () => {
        const context = { a: { b: { c: 'deep' } } }
        expect(renderTemplate('{{a.b.c}}', context)).toBe('deep')
    })
})
