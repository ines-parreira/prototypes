import type { Expression } from 'estree'

import {
    buildMetafieldBasePath,
    METAFIELD_CATEGORY_PATTERNS,
} from 'pages/common/components/ast/expression/metafields/constants'
import type { SupportedCategories } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/types'

import type { ObjectExpressionPropertyKey } from '../../state/rules/types'
import type { RuleObject } from './types'
import { IdentifierCategoryKey } from './types'

export function getAstPath(
    property: ObjectExpressionPropertyKey,
    object: RuleObject | Expression,
): string[] {
    if ((object as ObjectExpressionPropertyKey).name) {
        return [(object as ObjectExpressionPropertyKey).name, property.name]
    }
    if (property.name)
        return getAstPath(
            (object as RuleObject).property,
            (object as RuleObject).object,
        ).concat([property.name])
    return getAstPath(
        (object as RuleObject).property,
        (object as RuleObject).object,
    )
}

export function generateExpression([
    currentValue,
    ...other
]: string[]): RuleObject {
    return {
        computed: false,
        object:
            other.length > 1
                ? generateExpression(other)
                : {
                      name: other[0],
                      type: 'Identifier',
                  },
        property: {
            name: currentValue,
            type: 'Identifier',
        },
        type: 'MemberExpression',
    } as RuleObject
}

export function getCategoryFromPath(path: string[]): IdentifierCategoryKey {
    const jointPath = path.slice(0, path.length - 1).join('.')
    if (
        jointPath.includes('shopify.customer.metafields') ||
        METAFIELD_CATEGORY_PATTERNS.Customer.test(jointPath)
    ) {
        return IdentifierCategoryKey.ShopifyCustomerMetafields
    } else if (
        jointPath.includes('shopify.last_order.metafields') ||
        METAFIELD_CATEGORY_PATTERNS.Order.test(jointPath)
    ) {
        return IdentifierCategoryKey.ShopifyLastOrderMetafields
    } else if (
        jointPath.includes('shopify.last_draft_order.metafields') ||
        METAFIELD_CATEGORY_PATTERNS.DraftOrder.test(jointPath)
    ) {
        return IdentifierCategoryKey.ShopifyLastDraftOrderMetafields
    } else if (jointPath.includes('shopify.last_order')) {
        return IdentifierCategoryKey.ShopifyLastOrder
    } else if (jointPath.includes('shopify.customer')) {
        return IdentifierCategoryKey.ShopifyCustomer
    } else if (jointPath.includes('magento2.last_order')) {
        return IdentifierCategoryKey.Magento2LastOrder
    } else if (jointPath.includes('magento2.customer')) {
        return IdentifierCategoryKey.Magento2Customer
    } else if (jointPath.includes('recharge.last_subscription')) {
        return IdentifierCategoryKey.RechargeLastSubscription
    } else if (jointPath.includes('recharge.customer')) {
        return IdentifierCategoryKey.RechargeCustomer
    } else if (jointPath.includes('bigcommerce.last_order')) {
        return IdentifierCategoryKey.BigCommerceLastOrder
    } else if (jointPath.includes('bigcommerce.customer')) {
        return IdentifierCategoryKey.BigCommerceCustomer
    } else if (jointPath.includes('integrations.smile.customer')) {
        return IdentifierCategoryKey.SmileCustomer
    } else if (jointPath.includes('instagram.profile')) {
        return IdentifierCategoryKey.InstagramProfile
    } else if (jointPath.includes('ticket.customer')) {
        return IdentifierCategoryKey.Customer
    } else if (path.includes('self_service_flow')) {
        return IdentifierCategoryKey.SelfServiceFlow
    }
    return path[0] as IdentifierCategoryKey
}

export function getMetafieldTreePath(
    category: SupportedCategories,
    integrationId: number,
): string {
    return buildMetafieldBasePath(integrationId, category)
}
