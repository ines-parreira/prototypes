import {fromJS, List, Map} from 'immutable'

import {
    rule,
    ruleWithBusinessHourIdentifier,
    ruleWithContainsAllIdentifier,
} from '../../../fixtures/rule'
import {RuleObject, IdentifierCategoryKey} from '../types'
import {getAstPath, getFormattedRule, getCategoryFromPath} from '../utils'

describe('rule utils', () => {
    describe('getAstPath', () => {
        it('should return the ast path when passing a rule', () => {
            const ruleObject: RuleObject = {
                loc: {},
                computed: false,
                object: {
                    loc: {},
                    type: 'MemberExpression',
                    computed: false,
                    object: {
                        loc: {},
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                            loc: {},
                            type: 'MemberExpression',
                            computed: false,
                            object: {
                                type: 'Identifier',
                                name: 'ticket',
                            },
                            property: {
                                type: 'Identifier',
                                name: 'customer',
                            },
                        },
                        property: {
                            type: 'Identifier',
                            name: 'integrations',
                        },
                    },
                    property: {
                        type: 'Identifier',
                        name: 'shopify',
                    },
                },
                property: {
                    type: 'Identifier',
                    name: 'customer',
                },
                type: 'MemberExpression',
            }

            expect(
                getAstPath(
                    {
                        name: 'created_at',
                        type: 'Identifier',
                    },
                    ruleObject
                )
            ).toEqual([
                'ticket',
                'customer',
                'integrations',
                'shopify',
                'customer',
                'created_at',
            ])
        })
    })

    describe('getFormattedRule', () => {
        it('should return the formatted rule based on dirty rule', () => {
            expect(
                getFormattedRule(
                    fromJS(rule),
                    'ticket.customer.integrations.shopify.last_order.created_at',
                    fromJS(['body', 0, 'test', 'arguments', 0])
                )
            ).toMatchSnapshot()
        })
        it('should not keep the second argument of a binary operator when switching to a unary operator', () => {
            const leftOperandPath = fromJS([
                'body',
                '0',
                'test',
                'arguments',
                '0',
            ])
            const binaryOperatorRule = getFormattedRule(
                fromJS(ruleWithBusinessHourIdentifier),
                'message.text',
                leftOperandPath
            )
            const unaryOperatorRule = getFormattedRule(
                fromJS(binaryOperatorRule),
                'message.created_datetime',
                leftOperandPath
            )
            expect(
                unaryOperatorRule.getIn([
                    'code_ast',
                    'body',
                    0,
                    'test',
                    'callee',
                    'name',
                ])
            ).toBe('duringBusinessHours')
            expect(
                (unaryOperatorRule.getIn([
                    'code_ast',
                    'body',
                    0,
                    'test',
                    'arguments',
                ]) as List<any>).size
            ).toBe(1)
        })
        it('should set the second argument of a binary operator to null when changing the left operand', () => {
            const leftOperandPath = fromJS([
                'body',
                '0',
                'test',
                'arguments',
                '0',
            ])
            const binaryOperatorRule = getFormattedRule(
                fromJS(rule),
                'message.text',
                leftOperandPath
            )
            const rightOperandPath = [
                'code_ast',
                'body',
                0,
                'test',
                'arguments',
                1,
            ]
            const rightOperand: Map<any, any> = binaryOperatorRule.getIn(
                rightOperandPath
            )
            expect(rightOperand.toJS()).toEqual({
                type: 'Literal',
                value: null,
                loc: expect.any(Object),
                raw: 'null',
            })
        })
        it('should set the second argument of a binary operator to empty array when changing the left operand', () => {
            const leftOperandPath = fromJS([
                'body',
                '0',
                'test',
                'arguments',
                '0',
            ])
            const arrayExpressionRule = getFormattedRule(
                fromJS(ruleWithContainsAllIdentifier),
                'message.text',
                leftOperandPath
            )
            const rightOperandPath = [
                'code_ast',
                'body',
                0,
                'test',
                'arguments',
                1,
            ]
            const rightOperand: Map<any, any> = arrayExpressionRule.getIn(
                rightOperandPath
            )
            expect(rightOperand.toJS()).toEqual({
                type: 'ArrayExpression',
                elements: [],
                loc: expect.any(Object),
            })
        })
    })

    describe('getCategoryFromPath', () => {
        it.each([
            [
                IdentifierCategoryKey.ShopifyLastOrder,
                [
                    'ticket',
                    'customer',
                    'integrations',
                    'shopify',
                    'last_order',
                    'created_at',
                ],
            ],
            [
                IdentifierCategoryKey.Magento2Customer,
                [
                    'ticket',
                    'customer',
                    'integrations',
                    'magento2',
                    'customer',
                    'created_at',
                ],
            ],
            [
                IdentifierCategoryKey.RechargeCustomer,
                [
                    'ticket',
                    'customer',
                    'integrations',
                    'recharge',
                    'customer',
                    'created_at',
                ],
            ],
            [
                IdentifierCategoryKey.Customer,
                ['ticket', 'customer', 'created_at'],
            ],
            [IdentifierCategoryKey.Message, ['message', 'created_at']],
        ])('should return the identifier category %s', (key, path) => {
            expect(getCategoryFromPath(path)).toBe(key)
        })
    })
})
