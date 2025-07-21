import { Expression } from 'estree'

import resolveObjectPath from '../resolveObjectPath'

describe('resolveObjectPath', () => {
    it('should return object path for MemberExpression', () => {
        const node = {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: 'ticket',
            },
            property: {
                type: 'Identifier',
                name: 'status',
            },
        } as Expression
        expect(resolveObjectPath(node)).toBe('ticket.status')
    })

    it('should return object path for Identifier', () => {
        const node = {
            type: 'Identifier',
            name: 'ticket',
        } as Expression
        expect(resolveObjectPath(node)).toBe('ticket')
    })

    it('should return object path for Literal', () => {
        const node = {
            type: 'Literal',
            value: true,
        } as Expression
        expect(resolveObjectPath(node)).toBe('true')
    })

    it('should throw error when type is unknown', () => {
        const node = {
            type: 'UnaryExpression',
            argument: {
                type: 'Identifier',
                name: 'ticket',
            },
        } as Expression
        expect(() => resolveObjectPath(node)).toThrow(
            'Unknown type: UnaryExpression',
        )
    })
})
