import {fromJS} from 'immutable'

import * as utils from '../utils.ts'
import schemasJSON from '../../../fixtures/openapi.json'
import {findProperty, toImmutable} from '../../../utils.ts'

describe('resolveCallee function', () => {
    const schemas = fromJS(schemasJSON)
    const callExpression = fromJS({})

    it('should return first operator when there is no default', () => {
        let firstArgSchema = toImmutable(
            findProperty('ticket.snooze_datetime', schemas)
        )
        expect(['isEmpty', 'isNotEmpty']).toContain(
            utils.resolveCallee(callExpression, firstArgSchema)
        )

        firstArgSchema = toImmutable(findProperty('ticket.language', schemas))
        expect(['eq', 'neq']).toContain(
            utils.resolveCallee(callExpression, firstArgSchema)
        )

        firstArgSchema = toImmutable(findProperty('ticket.channel', schemas))
        expect(['eq', 'neq']).toContain(
            utils.resolveCallee(callExpression, firstArgSchema)
        )
    })

    it('should return default operator', () => {
        let firstArgSchema = toImmutable(
            findProperty('ticket.created_datetime', schemas)
        )
        expect(utils.resolveCallee(callExpression, firstArgSchema)).toBe(
            'gteTimedelta'
        )
    })

    it('should not return default operator because it is deprecated', () => {
        const deprecatedOperator = 'contains'
        let firstArgSchema = toImmutable(
            findProperty('ticket.created_datetime', schemas)
        ).setIn(['meta', 'defaultOperator'], deprecatedOperator)

        const resolvedOperator = utils.resolveCallee(
            callExpression,
            firstArgSchema
        )

        expect(resolvedOperator).not.toBe(deprecatedOperator)
        expect(
            Object.keys(firstArgSchema.getIn(['meta', 'operators']).toJS())
        ).toContain(resolvedOperator)
    })

    it('should not return first operator because it is deprecated', () => {
        let firstArgSchema = toImmutable(
            findProperty('ticket.channel', schemas)
        ).setIn(
            ['meta', 'operators'],
            fromJS({
                contains: {label: 'contains'},
                eq: {label: 'is'},
            })
        )

        expect(utils.resolveCallee(callExpression, firstArgSchema)).toBe('eq')
    })
})
