import type { RuleObject } from '../types'
import { IdentifierCategoryKey } from '../types'
import { getAstPath, getCategoryFromPath, getMetafieldTreePath } from '../utils'

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
                    ruleObject,
                ),
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
                IdentifierCategoryKey.BigCommerceCustomer,
                [
                    'ticket',
                    'customer',
                    'integrations',
                    'bigcommerce',
                    'customer',
                    'date_created',
                ],
            ],
            [
                IdentifierCategoryKey.InstagramProfile,
                [
                    'ticket',
                    'customer',
                    'integrations',
                    'facebook',
                    'instagram',
                    'profile',
                    'business_follows_customer',
                ],
            ],
            [
                IdentifierCategoryKey.SmileCustomer,
                [
                    'ticket',
                    'customer',
                    'integrations',
                    'smile',
                    'customer',
                    'state',
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

        it.each([
            [
                IdentifierCategoryKey.ShopifyCustomerMetafields,
                [
                    'ticket',
                    'customer',
                    'integrations',
                    'shopify',
                    'stores',
                    '123',
                    'customer',
                    'metafields',
                    'vip_status',
                    'value',
                ],
            ],
            [
                IdentifierCategoryKey.ShopifyLastOrderMetafields,
                [
                    'ticket',
                    'customer',
                    'integrations',
                    'shopify',
                    'stores',
                    '456',
                    'last_order',
                    'metafields',
                    'order_tag',
                    'value',
                ],
            ],
            [
                IdentifierCategoryKey.ShopifyLastDraftOrderMetafields,
                [
                    'ticket',
                    'customer',
                    'integrations',
                    'shopify',
                    'stores',
                    '789',
                    'last_draft_order',
                    'metafields',
                    'draft_note',
                    'value',
                ],
            ],
        ])(
            'should return the metafield identifier category %s for new path format',
            (key, path) => {
                expect(getCategoryFromPath(path)).toBe(key)
            },
        )
    })

    describe('getMetafieldTreePath', () => {
        it.each([
            {
                category: 'Customer' as const,
                integrationId: 123,
                expected:
                    'ticket.customer.integrations.shopify.stores.123.customer.metafields',
            },
            {
                category: 'Order' as const,
                integrationId: 456,
                expected:
                    'ticket.customer.integrations.shopify.stores.456.last_order.metafields',
            },
            {
                category: 'DraftOrder' as const,
                integrationId: 789,
                expected:
                    'ticket.customer.integrations.shopify.stores.789.last_draft_order.metafields',
            },
        ])(
            'returns correct path for $category category',
            ({ category, integrationId, expected }) => {
                expect(getMetafieldTreePath(category, integrationId)).toBe(
                    expected,
                )
            },
        )
    })
})
