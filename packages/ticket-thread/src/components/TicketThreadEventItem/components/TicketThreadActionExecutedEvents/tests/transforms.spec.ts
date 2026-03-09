import type { BaseIntegration } from '@gorgias/helpdesk-types'

import {
    getActionExecutedErrorMessage,
    getActionExecutedPayloadEntries,
} from '../transforms/details'
import { resolveActionExecutedIntegration } from '../transforms/integration'
import { getActionExecutedLabel } from '../transforms/labels'
import { getActionExecutedOrderToken } from '../transforms/orderToken'
import {
    getActionExecutedSourceFamily,
    getActionExecutedSourceIconName,
} from '../transforms/source'
import type {
    ActionExecutedActionName,
    ActionExecutedPayload,
    ActionExecutedSourceFamily,
} from '../transforms/types'

function createIntegration(
    overrides: Partial<BaseIntegration> = {},
): BaseIntegration {
    return {
        id: 1,
        name: 'Integration',
        type: 'shopify',
        meta: {},
        ...overrides,
    } as BaseIntegration
}

const defaultLabelCases: ReadonlyArray<[ActionExecutedActionName, string]> = [
    ['shopifyRefundShippingCostOfOrder', 'Refund shipping cost of order'],
    ['shopifyCancelOrder', 'Cancel order'],
    ['shopifyRefundOrder', 'Refund order'],
    ['shopifyFullRefundOrder', 'Full refund order'],
    ['shopifyCreateOrder', 'Create order'],
    ['shopifyDuplicateOrder', 'Duplicate order'],
    ['shopifySendDraftOrderInvoice', 'Send invoice for draft order'],
    ['shopifyPartialRefundOrder', 'Partial refund order'],
    ['shopifyUpdateOrderTags', 'Edit order tags'],
    ['shopifyUpdateCustomerTags', 'Edit customer tags'],
    ['shopifyEditOrder', 'Edit order'],
    ['shopifyEditShippingAddressOfOrder', 'Edit shipping address'],
    ['shopifyEditNoteOfOrder', 'Edit note of order'],
    ['bigcommerceCreateOrder', 'Create order'],
    ['bigcommerceDuplicateOrder', 'Duplicate order'],
    ['bigcommerceRefundOrder', 'Refund order'],
    ['rechargeCancelSubscription', 'Cancel subscription'],
    ['rechargeActivateSubscription', 'Activate subscription'],
    ['rechargeSkipCharge', 'Skip charge'],
    ['rechargeUnskipCharge', 'Unskip charge'],
    ['rechargeRefundCharge', 'Refund charge'],
    ['rechargeRefundOrder', 'Refund order'],
    ['customHttpAction', 'Custom HTTP action'],
]

describe('getActionExecutedLabel', () => {
    it('returns the action label when a non-empty custom label is provided', () => {
        expect(
            getActionExecutedLabel({
                actionName: 'shopifyRefundOrder',
                actionLabel: 'Issue refund now',
            }),
        ).toBe('Issue refund now')
    })

    it.each(defaultLabelCases)(
        'returns default label for %s when custom label is blank',
        (actionName, expectedLabel) => {
            expect(
                getActionExecutedLabel({
                    actionName,
                    actionLabel: '   ',
                }),
            ).toBe(expectedLabel)
            expect(
                getActionExecutedLabel({
                    actionName,
                    actionLabel: undefined,
                }),
            ).toBe(expectedLabel)
        },
    )
})

describe('getActionExecutedSourceFamily', () => {
    it('prefers integration type over action prefix and normalizes casing', () => {
        expect(
            getActionExecutedSourceFamily({
                actionName: 'customHttpAction',
                integrationType: 'SHOPIFY',
            }),
        ).toBe('shopify')
    })

    it.each<
        [
            ActionExecutedActionName,
            string | undefined,
            ActionExecutedSourceFamily,
        ]
    >([
        ['customHttpAction', 'bigcommerce', 'bigcommerce'],
        ['customHttpAction', 'recharge', 'recharge'],
        ['shopifyRefundOrder', undefined, 'shopify'],
        ['bigcommerceRefundOrder', undefined, 'bigcommerce'],
        ['rechargeRefundOrder', undefined, 'recharge'],
        ['customHttpAction', undefined, 'custom-http'],
        ['customHttpAction', 'http', 'custom-http'],
        ['shopifyRefundOrder', 'unknown', 'shopify'],
    ])(
        'resolves family for action=%s and integrationType=%s',
        (actionName, integrationType, expectedFamily) => {
            expect(
                getActionExecutedSourceFamily({
                    actionName,
                    integrationType,
                }),
            ).toBe(expectedFamily)
        },
    )
})

describe('getActionExecutedSourceIconName', () => {
    it.each<[ActionExecutedSourceFamily, string]>([
        ['shopify', 'vendor-shopify-colored'],
        ['bigcommerce', 'vendor-bicommerce-colored'],
        ['recharge', 'shopping-bag'],
        ['custom-http', 'webhook'],
    ])('returns icon for %s', (sourceFamily, expectedIconName) => {
        expect(getActionExecutedSourceIconName(sourceFamily)).toBe(
            expectedIconName,
        )
    })
})

describe('resolveActionExecutedIntegration', () => {
    const firstIntegration = createIntegration({
        id: 1,
        name: 'Shop 1',
    })
    const secondIntegration = createIntegration({
        id: 2,
        name: 'Shop 2',
    })
    const integrations = [firstIntegration, secondIntegration]

    it('returns null for missing integrations or missing integration id', () => {
        expect(resolveActionExecutedIntegration(undefined, 1)).toBeNull()
        expect(resolveActionExecutedIntegration([], 1)).toBeNull()
        expect(resolveActionExecutedIntegration(integrations, null)).toBeNull()
        expect(
            resolveActionExecutedIntegration(integrations, undefined),
        ).toBeNull()
    })

    it('matches integrations by stringified id and returns null when no match', () => {
        expect(resolveActionExecutedIntegration(integrations, '1')).toBe(
            firstIntegration,
        )
        expect(resolveActionExecutedIntegration(integrations, 2)).toBe(
            secondIntegration,
        )
        expect(resolveActionExecutedIntegration(integrations, '999')).toBeNull()
    })
})

describe('getActionExecutedPayloadEntries', () => {
    it('formats payload keys, converts values, and skips undefined values', () => {
        const payload: ActionExecutedPayload = {
            simple_text: 'ready',
            count: 12,
            active: false,
            nullable: null,
            nested_object: { source: 'api' },
            symbol_value: Symbol('token'),
            '  multi   word_key  ': 'kept as is',
            ignored_value: undefined,
        }

        expect(getActionExecutedPayloadEntries(payload)).toEqual([
            { key: 'Simple Text', value: 'ready' },
            { key: 'Count', value: '12' },
            { key: 'Active', value: 'false' },
            { key: 'Nullable', value: 'null' },
            { key: 'Nested Object', value: '{"source":"api"}' },
            { key: 'Symbol Value', value: 'Symbol(token)' },
            { key: 'Multi Word Key', value: 'kept as is' },
        ])
    })
})

describe('getActionExecutedErrorMessage', () => {
    it('returns null when message is missing', () => {
        expect(
            getActionExecutedErrorMessage({
                status: 'error',
                message: undefined,
            }),
        ).toBeNull()
    })

    it('returns message for statuses that contain "error" or "fail"', () => {
        expect(
            getActionExecutedErrorMessage({
                status: 'ERROR',
                message: 'Unable to execute action',
            }),
        ).toBe('Unable to execute action')
        expect(
            getActionExecutedErrorMessage({
                status: 'failed',
                message: 'Retry required',
            }),
        ).toBe('Retry required')
    })

    it('returns null for non-failure statuses', () => {
        expect(
            getActionExecutedErrorMessage({
                status: 'success',
                message: 'Request completed',
            }),
        ).toBeNull()
        expect(
            getActionExecutedErrorMessage({
                status: undefined,
                message: 'Unknown state',
            }),
        ).toBeNull()
    })
})

describe('getActionExecutedOrderToken', () => {
    it('builds Shopify links for draft orders and normal orders', () => {
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'shopify',
                payload: {
                    draft_order_id: 1122,
                    draft_order_name: 'Draft #1122',
                },
                integration: createIntegration({
                    meta: {
                        shop_name: 'main-shop',
                    },
                }),
            }),
        ).toEqual({
            label: 'Draft #1122',
            href: 'https://main-shop.myshopify.com/admin/draft_orders/1122',
        })

        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'shopify',
                payload: { order_id: 360037000 },
                integration: createIntegration({
                    meta: {
                        shop_name: '  main-shop  ',
                    },
                }),
            }),
        ).toEqual({
            label: '#360037000',
            href: 'https://main-shop.myshopify.com/admin/orders/360037000',
        })
    })

    it('falls back to labels when Shopify link metadata is missing or invalid', () => {
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'shopify',
                payload: { draft_order_id: 1122 },
                integration: createIntegration({
                    meta: {
                        shop_name: 'main shop',
                    },
                }),
            }),
        ).toEqual({
            label: '#1122',
        })

        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'shopify',
                payload: { order_id: 45 },
                integration: createIntegration({
                    meta: {
                        shop_name: '   ',
                    },
                }),
            }),
        ).toEqual({
            label: '#45',
        })

        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'shopify',
                payload: { id: 'shopify-fallback-id' },
                integration: createIntegration({
                    meta: {
                        shop_name: 123,
                    },
                }),
            }),
        ).toEqual({
            label: '#shopify-fallback-id',
        })
    })

    it('builds BigCommerce order links and falls back when needed', () => {
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'bigcommerce',
                payload: { bigcommerce_order_id: 7001 },
                integration: createIntegration({
                    meta: {
                        store_hash: 'abc123',
                    },
                }),
            }),
        ).toEqual({
            label: '#7001',
            href: 'https://store-abc123.mybigcommerce.com/manage/orders/7001',
        })

        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'bigcommerce',
                payload: { bigcommerce_checkout_id: 'checkout-77' },
                integration: createIntegration({
                    meta: {
                        store_hash: 'abc123',
                    },
                }),
            }),
        ).toEqual({
            label: '#checkout-77',
        })

        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'bigcommerce',
                payload: { bigcommerce_order_id: 7002 },
                integration: createIntegration({
                    meta: {
                        store_hash: 'invalid hash',
                    },
                }),
            }),
        ).toEqual({
            label: '#7002',
        })

        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'bigcommerce',
                payload: { id: 'bigcommerce-fallback-id' },
                integration: createIntegration({
                    meta: {},
                }),
            }),
        ).toEqual({
            label: '#bigcommerce-fallback-id',
        })
    })

    it('builds Recharge links for subscriptions and charges', () => {
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'recharge',
                payload: { subscription_id: 901 },
                integration: createIntegration({
                    meta: {
                        store_name: 'recharge-store',
                    },
                }),
            }),
        ).toEqual({
            label: '#901',
            href: 'https://recharge-store.myshopify.com/tools/recurring/subscriptions/901',
        })

        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'recharge',
                payload: { charge_id: 'charge-555' },
                integration: createIntegration({
                    meta: {
                        store_name: 'recharge-store',
                    },
                }),
            }),
        ).toEqual({
            label: '#charge-555',
            href: 'https://recharge-store.myshopify.com/tools/recurring/charges/charge-555',
        })

        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'recharge',
                payload: { charge_id: 999 },
                integration: createIntegration({
                    meta: {
                        store_name: 'invalid store',
                    },
                }),
            }),
        ).toEqual({
            label: '#999',
        })
    })

    it('uses custom-http fallback keys in priority order', () => {
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: { order_id: 1 },
                integration: null,
            }),
        ).toEqual({ label: '#1' })
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: { draft_order_name: 'Draft Order 2' },
                integration: null,
            }),
        ).toEqual({ label: 'Draft Order 2' })
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: { draft_order_id: 3 },
                integration: null,
            }),
        ).toEqual({ label: '#3' })
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: { bigcommerce_order_id: 4 },
                integration: null,
            }),
        ).toEqual({ label: '#4' })
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: { bigcommerce_checkout_id: 'checkout-5' },
                integration: null,
            }),
        ).toEqual({ label: '#checkout-5' })
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: { subscription_id: 6 },
                integration: null,
            }),
        ).toEqual({ label: '#6' })
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: { charge_id: 7 },
                integration: null,
            }),
        ).toEqual({ label: '#7' })
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: { id: '#already-tagged' },
                integration: null,
            }),
        ).toEqual({ label: '#already-tagged' })
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: {
                    draft_order_name: '   ',
                    id: 'fallback-id',
                },
                integration: null,
            }),
        ).toEqual({ label: '#fallback-id' })
    })

    it('falls back for recharge when source-specific ids are not present and returns null when no token exists', () => {
        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'recharge',
                payload: {
                    draft_order_name: 'Draft Order Recharge',
                },
                integration: null,
            }),
        ).toEqual({ label: 'Draft Order Recharge' })

        expect(
            getActionExecutedOrderToken({
                sourceFamily: 'custom-http',
                payload: {},
                integration: null,
            }),
        ).toBeNull()
    })
})
