import type { BaseIntegration } from '@gorgias/helpdesk-types'

import { assertNever } from '../../../../../utils/assertNever'
import type {
    ActionExecutedOrderToken,
    ActionExecutedPayload,
    ActionExecutedSourceFamily,
} from './types'

function getIntegrationMetaString(
    integration: BaseIntegration | null,
    key: string,
): string | null {
    const value = integration?.meta?.[key]

    if (typeof value !== 'string' || !value.trim()) {
        return null
    }

    return value.trim()
}

function getPayloadStringOrNumber(
    payload: ActionExecutedPayload,
    key: string,
): string | null {
    const value = payload[key]

    if (typeof value === 'number') {
        return value.toString()
    }

    if (typeof value === 'string' && value.trim()) {
        return value
    }

    return null
}

function isSafeSubdomainSegment(value: string): boolean {
    return /^[a-z0-9-]+$/i.test(value)
}

function getShopifyOrderToken({
    payload,
    integration,
}: {
    payload: ActionExecutedPayload
    integration: BaseIntegration | null
}): ActionExecutedOrderToken | null {
    const shopName = getIntegrationMetaString(integration, 'shop_name')
    const orderId = getPayloadStringOrNumber(payload, 'order_id')
    const draftOrderId = getPayloadStringOrNumber(payload, 'draft_order_id')
    const draftOrderName = getPayloadStringOrNumber(payload, 'draft_order_name')

    if (draftOrderName || draftOrderId) {
        const label = draftOrderName ?? `#${draftOrderId}`

        if (
            shopName &&
            draftOrderId &&
            isSafeSubdomainSegment(shopName.trim())
        ) {
            return {
                label,
                href: `https://${shopName}.myshopify.com/admin/draft_orders/${draftOrderId}`,
            }
        }

        return { label }
    }

    if (!orderId) {
        return null
    }

    if (shopName && isSafeSubdomainSegment(shopName.trim())) {
        return {
            label: `#${orderId}`,
            href: `https://${shopName}.myshopify.com/admin/orders/${orderId}`,
        }
    }

    return {
        label: `#${orderId}`,
    }
}

function getBigcommerceOrderToken({
    payload,
    integration,
}: {
    payload: ActionExecutedPayload
    integration: BaseIntegration | null
}): ActionExecutedOrderToken | null {
    const orderId = getPayloadStringOrNumber(payload, 'bigcommerce_order_id')
    const checkoutId = getPayloadStringOrNumber(
        payload,
        'bigcommerce_checkout_id',
    )
    const storeHash = getIntegrationMetaString(integration, 'store_hash')

    if (!orderId && !checkoutId) {
        return null
    }

    if (orderId && storeHash && isSafeSubdomainSegment(storeHash)) {
        return {
            label: `#${orderId}`,
            href: `https://store-${storeHash}.mybigcommerce.com/manage/orders/${orderId}`,
        }
    }

    return {
        label: `#${orderId ?? checkoutId}`,
    }
}

function getRechargeOrderToken({
    payload,
    integration,
}: {
    payload: ActionExecutedPayload
    integration: BaseIntegration | null
}): ActionExecutedOrderToken | null {
    const storeName = getIntegrationMetaString(integration, 'store_name')
    const subscriptionId = getPayloadStringOrNumber(payload, 'subscription_id')
    const chargeId = getPayloadStringOrNumber(payload, 'charge_id')

    if (!subscriptionId && !chargeId) {
        return null
    }

    const targetId = subscriptionId ?? chargeId
    const pathPrefix = subscriptionId ? 'subscriptions' : 'charges'

    if (storeName && isSafeSubdomainSegment(storeName)) {
        return {
            label: `#${targetId}`,
            href: `https://${storeName}.myshopify.com/tools/recurring/${pathPrefix}/${targetId}`,
        }
    }

    return {
        label: `#${targetId}`,
    }
}

function getFallbackOrderToken(
    payload: ActionExecutedPayload,
): ActionExecutedOrderToken | null {
    const fallbackLabel =
        getPayloadStringOrNumber(payload, 'order_id') ??
        getPayloadStringOrNumber(payload, 'draft_order_name') ??
        getPayloadStringOrNumber(payload, 'draft_order_id') ??
        getPayloadStringOrNumber(payload, 'bigcommerce_order_id') ??
        getPayloadStringOrNumber(payload, 'bigcommerce_checkout_id') ??
        getPayloadStringOrNumber(payload, 'subscription_id') ??
        getPayloadStringOrNumber(payload, 'charge_id') ??
        getPayloadStringOrNumber(payload, 'id')

    if (!fallbackLabel) {
        return null
    }

    if (fallbackLabel.startsWith('#')) {
        return {
            label: fallbackLabel,
        }
    }

    if (fallbackLabel.includes(' ')) {
        return {
            label: fallbackLabel,
        }
    }

    return {
        label: `#${fallbackLabel}`,
    }
}

export function getActionExecutedOrderToken({
    sourceFamily,
    payload,
    integration,
}: {
    sourceFamily: ActionExecutedSourceFamily
    payload: ActionExecutedPayload
    integration: BaseIntegration | null
}): ActionExecutedOrderToken | null {
    switch (sourceFamily) {
        case 'shopify':
            return (
                getShopifyOrderToken({ payload, integration }) ??
                getFallbackOrderToken(payload)
            )
        case 'bigcommerce':
            return (
                getBigcommerceOrderToken({ payload, integration }) ??
                getFallbackOrderToken(payload)
            )
        case 'recharge':
            return (
                getRechargeOrderToken({ payload, integration }) ??
                getFallbackOrderToken(payload)
            )
        case 'custom-http':
            return getFallbackOrderToken(payload)
        default:
            return assertNever(sourceFamily)
    }
}
