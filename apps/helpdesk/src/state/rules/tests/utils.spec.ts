import { fromJS, Map } from 'immutable'

import { toImmutable } from 'common/utils'

import schemasJSON from '../../../fixtures/openapi.json'
import { findProperty, getAST } from '../../../utils'
import { resolveCallee, resolveSecondArg, updateCallExpression } from '../utils'

const schemas = fromJS(schemasJSON) as Map<any, any>
const emptyCallExpression = fromJS({})
const getFirstArgSchema = (member: string) =>
    toImmutable<Map<any, any>>(findProperty(member, schemas)!)

describe('resolveCallee function', () => {
    it('should return first operator when there is no default', () => {
        let firstArgSchema = getFirstArgSchema('ticket.snooze_datetime')
        expect(['isEmpty', 'isNotEmpty']).toContain(
            resolveCallee(emptyCallExpression, firstArgSchema),
        )

        firstArgSchema = getFirstArgSchema('ticket.language')
        expect(['eq', 'neq']).toContain(
            resolveCallee(emptyCallExpression, firstArgSchema),
        )

        firstArgSchema = getFirstArgSchema('ticket.channel')
        expect(['eq', 'neq']).toContain(
            resolveCallee(emptyCallExpression, firstArgSchema),
        )
    })

    it('should return default operator', () => {
        const firstArgSchema = getFirstArgSchema('ticket.created_datetime')
        expect(resolveCallee(emptyCallExpression, firstArgSchema)).toBe(
            'gteTimedelta',
        )
    })

    it('should not return default operator because it is deprecated', () => {
        const deprecatedOperator = 'contains'
        const firstArgSchema = getFirstArgSchema(
            'ticket.created_datetime',
        ).setIn(['meta', 'defaultOperator'], deprecatedOperator)

        const resolvedOperator = resolveCallee(
            emptyCallExpression,
            firstArgSchema,
        )

        expect(resolvedOperator).not.toBe(deprecatedOperator)
        expect(
            Object.keys(
                (
                    firstArgSchema.getIn(['meta', 'operators']) as Map<any, any>
                ).toJS(),
            ),
        ).toContain(resolvedOperator)
    })

    it('should not return first operator because it is deprecated', () => {
        const firstArgSchema = getFirstArgSchema('ticket.channel').setIn(
            ['meta', 'operators'],
            fromJS({
                contains: { label: 'contains' },
                eq: { label: 'is' },
            }),
        )

        expect(resolveCallee(emptyCallExpression, firstArgSchema)).toBe('eq')
    })
})

describe('resolveSecondArg function', () => {
    const mockDate = '2019-01-26T05:34:56Z'
    beforeAll(() => {
        global.Date.now = jest.fn(() => +new Date(mockDate))
    })
    it.each([
        ['isEmpty', null],
        ['containsAll', '[]'],
        ['gteTimedelta', "'1d'"],
        ['gte', `'${mockDate}'`],
        ['eq', ''],
    ])('Should return default value (%s)', (callee, secondArg) => {
        // No current value, no schema
        expect(resolveSecondArg(emptyCallExpression, callee, false)).toBe(
            secondArg,
        )
    })

    it.each([
        ['isEmpty', 'ticket.snooze_datetime', null],
        ['containsAll', 'ticket.body', '[]'],
        ['gteTimedelta', 'ticket.created_datetime', "'1d'"],
        ['gte', 'ticket.created_datetime', `'${mockDate}'`],
        ['eq', 'ticket.channel', "'aircall'"],
    ])('Should return proper value (%s)', (callee, firstArg, secondArg) => {
        //No current value, with schema
        const firstArgSchema = getFirstArgSchema(firstArg)
        expect(
            resolveSecondArg(
                emptyCallExpression,
                callee,
                false,
                firstArgSchema,
            ),
        ).toBe(secondArg)
    })

    it.each([
        ['isEmpty', 'ticket.snooze_datetime', null],
        ['containsAll', 'ticket.body', '[email]'],
        ['gteTimedelta', 'ticket.created_datetime', "'1d'"],
        ['gte', 'ticket.created_datetime', `'${mockDate}'`],
        ['eq', 'ticket.channel', "'email'"],
    ])('Should return current value (%s)', (callee, firstArg, secondArg) => {
        //No current value, with schema
        const callExpression = fromJS({
            arguments: [
                null,
                {
                    type: 'Literal',
                    value: 'email',
                    raw: 'email',
                },
            ],
        })
        const firstArgSchema = getFirstArgSchema(firstArg)
        expect(
            resolveSecondArg(callExpression, callee, false, firstArgSchema),
        ).toBe(secondArg)
    })

    it.each([
        ['isEmpty', 'ticket.snooze_datetime', null],
        ['containsAll', 'ticket.body', '[]'],
        ['gteTimedelta', 'ticket.created_datetime', "'1d'"],
        ['gte', 'ticket.created_datetime', `'${mockDate}'`],
        ['eq', 'ticket.channel', "'aircall'"],
    ])('Should return reset value (%s)', (callee, firstArg, secondArg) => {
        //No current value, with schema
        const callExpression = fromJS({
            arguments: [
                null,
                {
                    type: 'Literal',
                    value: 'email',
                    raw: 'email',
                },
            ],
        })
        const firstArgSchema = getFirstArgSchema(firstArg)
        expect(
            resolveSecondArg(callExpression, callee, true, firstArgSchema),
        ).toBe(secondArg)
    })
})

describe('updateCallExpression function', () => {
    it('should handle custom field paths with bracket notation for numeric IDs', () => {
        const state = fromJS({
            type: 'Program',
            body: [
                {
                    test: {
                        arguments: [
                            {
                                object: {
                                    object: {
                                        object: {
                                            name: 'ticket',
                                            type: 'Identifier',
                                        },
                                        property: {
                                            name: 'custom_fields',
                                            type: 'Identifier',
                                        },
                                        type: 'MemberExpression',
                                    },
                                    property: {
                                        name: '123',
                                        type: 'Identifier',
                                    },
                                    type: 'MemberExpression',
                                },
                                property: {
                                    name: 'value',
                                    type: 'Identifier',
                                },
                                type: 'MemberExpression',
                            },
                            {
                                raw: '',
                                type: 'Literal',
                                value: '',
                            },
                        ],
                        callee: {
                            name: 'isEmpty',
                            type: 'Identifier',
                        },
                        type: 'CallExpression',
                    },
                    type: 'IfStatement',
                },
            ],
        })

        const path = fromJS(['body', 0, 'test', 'arguments', 0])

        const schemas = fromJS({
            definitions: {
                Ticket: {
                    properties: {
                        custom_fields: {
                            meta: {
                                operators: {
                                    text: {
                                        eq: { label: 'is' },
                                    },
                                },
                            },
                        },
                    },
                    type: 'object',
                },
            },
        })
        const output = updateCallExpression(state, path, schemas, 'text')
        const ast = getAST(
            "if (eq(ticket.custom_fields['123'].value, '')) {\n}",
        )

        const astValues = (ast.body[0] as { test: Record<string, any> }).test
            .arguments[0].object as Record<string, any>
        const outputValues = output.getIn(path).toJS().object

        expect(astValues.object.object.name).toEqual(
            outputValues.object.object.name,
        )
        expect(outputValues.object.object.name).toEqual('ticket')

        expect(astValues.object.property.name).toEqual(
            outputValues.object.property.name,
        )
        expect(outputValues.object.property.name).toEqual('custom_fields')

        expect(astValues.property.value).toEqual(outputValues.property.value)
        expect(outputValues.property.value).toEqual('123')
    })

    it('should handle regular property paths with dot notation', () => {
        const state = fromJS({
            code_ast: {
                type: 'Program',
                body: [
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            callee: { name: 'eq' },
                            arguments: [
                                {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'ticket',
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'subject',
                                    },
                                },
                                {
                                    type: 'Literal',
                                    value: 'test subject',
                                    raw: "'test subject'",
                                },
                            ],
                        },
                    },
                ],
            },
        })

        // Change the property name from 'subject' to 'status' to trigger path regeneration
        const path = fromJS([
            'code_ast',
            'body',
            0,
            'expression',
            'arguments',
            0,
            'property',
            'name',
        ])
        const modifiedState = state.setIn(path, 'status')

        const schemas = fromJS({
            definitions: {
                Ticket: {
                    properties: {
                        custom_fields: {
                            meta: {
                                operators: {
                                    eq: { label: 'is' },
                                    neq: { label: 'is not' },
                                },
                            },
                        },
                    },
                },
            },
        })

        const result = updateCallExpression(modifiedState, path, schemas)
        const ast = getAST("eq(ticket.status, '')")
        const output = result.getIn(['code_ast'])

        const astValues = (ast.body[0] as { expression: Record<string, any> })
            .expression.arguments[0] as Record<string, any>
        const outputValues = output
            .getIn(['body', 0, 'expression', 'arguments', 0])
            .toJS()

        expect(astValues.object.name).toEqual(outputValues.object.name)
        expect(outputValues.object.name).toEqual('ticket')

        expect(astValues.property.name).toEqual(outputValues.property.name)
        expect(outputValues.property.name).toEqual('status')

        // Verify the second argument
        const astSecondArg = (
            ast.body[0] as { expression: Record<string, any> }
        ).expression.arguments[1] as Record<string, any>
        const outputSecondArg = output
            .getIn(['body', 0, 'expression', 'arguments', 1])
            .toJS()

        expect(astSecondArg.value).toEqual(outputSecondArg.value)
        expect(outputSecondArg.value).toEqual('')
    })

    it('should handle Literal nodes by extracting their values for path building', () => {
        const state = fromJS({
            type: 'Program',
            body: [
                {
                    type: 'IfStatement',
                    test: {
                        type: 'CallExpression',
                        callee: { name: 'eq' },
                        arguments: [
                            {
                                type: 'MemberExpression',
                                object: {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'ticket',
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'custom_fields',
                                    },
                                },
                                property: {
                                    type: 'Literal',
                                    value: '456',
                                    raw: '456',
                                },
                            },
                            {
                                type: 'Literal',
                                value: 'test value',
                                raw: "'test value'",
                            },
                        ],
                    },
                },
            ],
        })

        const path = fromJS(['body', 0, 'test', 'callee', 'name'])
        const modifiedState = state.setIn(path, 'neq')

        const schemas = fromJS({
            definitions: {
                Ticket: {
                    properties: {
                        custom_fields: {
                            meta: {
                                operators: {
                                    eq: { label: 'is' },
                                    neq: { label: 'is not' },
                                },
                            },
                        },
                    },
                },
            },
        })

        const output = updateCallExpression(modifiedState, path, schemas)
        const ast = getAST(
            "if (neq(ticket.custom_fields['456'].value, '')) { \n }",
        )

        const astValues = (ast.body[0] as { test: Record<string, any> }).test
            .arguments[0].object as Record<string, any>
        const outputValues = output
            .getIn(['body', 0, 'test', 'arguments', 0])
            .toJS()

        expect(astValues.object.object.name).toEqual(
            outputValues.object.object.name,
        )
        expect(outputValues.object.object.name).toEqual('ticket')

        expect(astValues.object.property.name).toEqual(
            outputValues.object.property.name,
        )
        expect(outputValues.object.property.name).toEqual('custom_fields')

        expect(astValues.property.value).toEqual(outputValues.property.value)
        expect(outputValues.property.value).toEqual('456')

        // Verify the operator change
        const astTest = (ast.body[0] as { test: Record<string, any> })
            .test as Record<string, any>
        const outputTest = output.getIn(['body', 0, 'test']).toJS()

        expect(astTest.callee.name).toEqual(outputTest.callee.name)
        expect(outputTest.callee.name).toEqual('neq')
    })
})
