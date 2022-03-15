import {ObjectExpressionPropertyKey} from '../../state/rules/types'

import {RuleObject, IdentifierCategoryKey} from './types'

export function getAstPath(
    property: ObjectExpressionPropertyKey,
    object: RuleObject | ObjectExpressionPropertyKey
): string[] {
    if ((object as ObjectExpressionPropertyKey).name) {
        return [(object as ObjectExpressionPropertyKey).name, property.name]
    }
    return getAstPath(
        (object as RuleObject).property,
        (object as RuleObject).object
    ).concat([property.name])
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

    if (jointPath.includes('shopify.last_order')) {
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
    } else if (jointPath.includes('integrations.smile.customer')) {
        return IdentifierCategoryKey.SmileCustomer
    } else if (jointPath.includes('ticket.customer')) {
        return IdentifierCategoryKey.Customer
    } else if (path.includes('self_service_flow')) {
        return IdentifierCategoryKey.SelfServiceFlow
    }
    return path[0] as IdentifierCategoryKey
}
