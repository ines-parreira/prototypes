export enum ShopifyTagsOperators {
    ContainsAll = 'containsAll',
    ContainsAny = 'containsAny',
    NotContains = 'notContains',
}

const SHOPIFY_TAGS_OPERATORS = ['containsAll', 'containsAny', 'notContains']

export function isShopifyTagsOperators(
    operator: string
): operator is ShopifyTagsOperators {
    return SHOPIFY_TAGS_OPERATORS.includes(operator)
}
