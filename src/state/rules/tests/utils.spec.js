import {fromJS} from 'immutable'

import {resolveCallee, resolveSecondArg} from '../utils.ts'
import schemasJSON from '../../../fixtures/openapi.json'
import {findProperty, toImmutable} from '../../../utils.ts'

const schemas = fromJS(schemasJSON)
const emptyCallExpression = fromJS({})
const getFirstArgSchema = (member) => toImmutable(findProperty(member, schemas))

describe('resolveCallee function', () => {
    it('should return first operator when there is no default', () => {
        let firstArgSchema = getFirstArgSchema('ticket.snooze_datetime')
        expect(['isEmpty', 'isNotEmpty']).toContain(
            resolveCallee(emptyCallExpression, firstArgSchema)
        )

        firstArgSchema = getFirstArgSchema('ticket.language')
        expect(['eq', 'neq']).toContain(
            resolveCallee(emptyCallExpression, firstArgSchema)
        )

        firstArgSchema = getFirstArgSchema('ticket.channel')
        expect(['eq', 'neq']).toContain(
            resolveCallee(emptyCallExpression, firstArgSchema)
        )
    })

    it('should return default operator', () => {
        const firstArgSchema = getFirstArgSchema('ticket.created_datetime')
        expect(resolveCallee(emptyCallExpression, firstArgSchema)).toBe(
            'gteTimedelta'
        )
    })

    it('should not return default operator because it is deprecated', () => {
        const deprecatedOperator = 'contains'
        let firstArgSchema = getFirstArgSchema('ticket.created_datetime').setIn(
            ['meta', 'defaultOperator'],
            deprecatedOperator
        )

        const resolvedOperator = resolveCallee(
            emptyCallExpression,
            firstArgSchema
        )

        expect(resolvedOperator).not.toBe(deprecatedOperator)
        expect(
            Object.keys(firstArgSchema.getIn(['meta', 'operators']).toJS())
        ).toContain(resolvedOperator)
    })

    it('should not return first operator because it is deprecated', () => {
        let firstArgSchema = getFirstArgSchema('ticket.channel', schemas).setIn(
            ['meta', 'operators'],
            fromJS({
                contains: {label: 'contains'},
                eq: {label: 'is'},
            })
        )

        expect(resolveCallee(emptyCallExpression, firstArgSchema)).toBe('eq')
    })
})

describe('resolveSecondArg function', () => {
    const mockDate = '2019-01-26T05:34:56-07:00'
    beforeAll(() => {
        global.Date.now = jest.fn(() => new Date(mockDate))
    })
    it.each([
        ['isEmpty', null],
        ['containsAll', '[]'],
        ['gteTimedelta', "'1d'"],
        ['gte', `'${mockDate}'`],
        ['eq', ''],
    ])('Should return default value (%s)', (callee, secondArg) => {
        // No current value, no schema
        expect(resolveSecondArg(emptyCallExpression, null, callee, false)).toBe(
            secondArg
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
            resolveSecondArg(emptyCallExpression, firstArgSchema, callee, false)
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
            resolveSecondArg(callExpression, firstArgSchema, callee, false)
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
            resolveSecondArg(callExpression, firstArgSchema, callee, true)
        ).toBe(secondArg)
    })
})
