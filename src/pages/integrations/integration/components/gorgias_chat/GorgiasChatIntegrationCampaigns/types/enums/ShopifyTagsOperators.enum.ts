export enum ShopifyTagsOperators {
    Contains = 'contains',
    NotContains = 'notContains',
    In = 'in',
    NotIn = 'notIn',
}

const SHOPIFY_TAGS_OPERATORS = ['contains', 'notContains', 'in', 'notIn']

export function isShopifyTagsOperators(
    operator: string
): operator is ShopifyTagsOperators {
    return SHOPIFY_TAGS_OPERATORS.includes(operator)
}
