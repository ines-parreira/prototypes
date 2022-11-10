export enum ProductTagsOperators {
    Contains = 'contains',
    Equal = 'eq',
}

const PRODUCT_TAGS_OPERATORS = ['contains', 'eq']

export function isProductTagsOperators(
    operator: string
): operator is ProductTagsOperators {
    return PRODUCT_TAGS_OPERATORS.includes(operator)
}
