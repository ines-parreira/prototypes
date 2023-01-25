export enum CurrentProductTagsOperators {
    Contains = 'contains',
    Equal = 'eq',
}

const CURRENT_PRODUCT_TAGS_OPERATORS = ['contains', 'eq']

export function isCurrentProductTagsOperators(
    operator: string
): operator is CurrentProductTagsOperators {
    return CURRENT_PRODUCT_TAGS_OPERATORS.includes(operator)
}
