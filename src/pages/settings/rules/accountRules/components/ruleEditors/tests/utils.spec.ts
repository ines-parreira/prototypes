import {RuleDraft} from 'state/rules/types'
import {getRuleActions} from '../utils'

describe('getActionTypeFromAST', () => {
    it('should return null for empty draft', () => {
        const result = getRuleActions({} as RuleDraft)
        expect(result).toEqual([])
    })

    it('should return null if arguments array is empty', () => {
        const body = [
            {
                type: 'ExpressionStatement',
                expression: {type: 'CallExpression', arguments: []},
            },
        ] as any

        const draft = {
            code_ast: {
                body,
            },
        }
        const result = getRuleActions(draft as RuleDraft)
        expect(result).toEqual([])
    })

    it('should return null if first argument value is missing', () => {
        const draft = {
            code_ast: {
                body: [
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            arguments: [{}],
                        },
                    },
                ],
            },
        }
        const result = getRuleActions(draft as unknown as RuleDraft)
        expect(result).toEqual([])
    })

    it('should return action type from first argument value', () => {
        const draft = {
            code_ast: {
                body: [
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            arguments: [
                                {type: 'Literal', value: 'replyToTicket'},
                            ],
                        },
                    },
                ],
            },
        }
        const result = getRuleActions(draft as RuleDraft)
        expect(result).toEqual(['replyToTicket'])
    })
})
