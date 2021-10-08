import {RuleObject, IdentifierCategoryKey} from '../types'
import {getAstPath, getCategoryFromPath} from '../utils'

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
