import moment from 'moment'

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

    describe('negative array indices', () => {
        it('resolves [-1] to the last element', () => {
            expect(
                renderTemplate('{{items[-1]}}', {
                    items: ['first', 'second', 'third'],
                }),
            ).toBe('third')
        })

        it('resolves [-2] to the second-to-last element', () => {
            expect(
                renderTemplate('{{items[-2]}}', {
                    items: ['first', 'second', 'third'],
                }),
            ).toBe('second')
        })

        it('resolves nested negative indices', () => {
            expect(
                renderTemplate('{{customer.orders[-1].id}}', {
                    customer: {
                        orders: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
                    },
                }),
            ).toBe('C')
        })
    })

    describe('object serialization', () => {
        it('serializes object values as JSON', () => {
            const context = { data: { nested: { a: 1, b: 2 } } }
            expect(renderTemplate('{{data.nested}}', context)).toBe(
                '{"a":1,"b":2}',
            )
        })

        it('serializes array values as JSON', () => {
            const context = { items: [1, 2, 3] }
            expect(renderTemplate('{{items}}', context)).toBe('[1,2,3]')
        })

        it('truncates long serialized objects', () => {
            const longArray = Array.from({ length: 2000 }, (_, i) => ({
                key: `item_${i}`,
                value: `value_${i}_padding`,
            }))
            const context = { data: longArray }
            const result = renderTemplate('{{data}}', context)
            expect(result.length).toBeLessThanOrEqual(4096)
            expect(result).toMatch(/\.\.\.$/)
        })
    })

    describe('filters', () => {
        it('applies datetime_format filter', () => {
            const context = {
                ticket: { created_datetime: '2024-06-15T10:30:00Z' },
            }
            const result = renderTemplate(
                "{{ticket.created_datetime|datetime_format('MM/DD/YYYY')}}",
                context,
            )
            expect(result).toBe(
                moment('2024-06-15T10:30:00Z').format('MM/DD/YYYY'),
            )
        })

        it('converts LDML day tokens for datetime_format', () => {
            const context = { date: '2024-01-05T00:00:00Z' }
            const result = renderTemplate(
                "{{date|datetime_format('d/MM/YYYY')}}",
                context,
            )
            expect(result).toBe(
                moment('2024-01-05T00:00:00Z').format('D/MM/YYYY'),
            )
        })

        it('returns empty for datetime_format with empty value', () => {
            const context = { date: '' }
            expect(
                renderTemplate(
                    "{{date|datetime_format('MM/DD/YYYY')}}",
                    context,
                ),
            ).toBe('')
        })

        it('applies fallback filter when value is empty', () => {
            const context = { name: '' }
            expect(
                renderTemplate("{{name|fallback('Unknown')}}", context),
            ).toBe('Unknown')
        })

        it('does not apply fallback when value is present', () => {
            const context = { name: 'Alice' }
            expect(
                renderTemplate("{{name|fallback('Unknown')}}", context),
            ).toBe('Alice')
        })

        it('applies fallback for missing variables', () => {
            expect(renderTemplate("{{missing|fallback('N/A')}}", {})).toBe(
                'N/A',
            )
        })
    })

    describe('keepTemplateWhenEmpty', () => {
        it('preserves template when variable is missing and keepTemplateWhenEmpty is true', () => {
            expect(renderTemplate('{{missing}}', {}, true)).toBe('{{missing}}')
        })

        it('still resolves existing variables when keepTemplateWhenEmpty is true', () => {
            expect(renderTemplate('{{name}}', { name: 'Alice' }, true)).toBe(
                'Alice',
            )
        })

        it('replaces missing with empty by default', () => {
            expect(renderTemplate('{{missing}}', {})).toBe('')
        })

        it('preserves template when value is null and keepTemplateWhenEmpty is true', () => {
            expect(renderTemplate('{{val}}', { val: null }, true)).toBe(
                '{{val}}',
            )
        })

        it('preserves template with filter when variable is missing', () => {
            expect(renderTemplate("{{missing|fallback('')}}", {}, true)).toBe(
                "{{missing|fallback('')}}",
            )
        })
    })

    describe('key-based array access', () => {
        it('resolves key-based array items', () => {
            const context = {
                customer: {
                    meta: [
                        { key: 'vip', value: 'true' },
                        { key: 'tier', value: 'gold' },
                    ],
                },
            }
            expect(
                renderTemplate('{{customer.meta.tier.value}}', context),
            ).toBe('gold')
        })
    })
})
