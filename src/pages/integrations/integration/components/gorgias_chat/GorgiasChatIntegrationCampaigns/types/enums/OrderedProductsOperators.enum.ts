export enum OrderedProductsOperators {
    Contains = 'contains',
    NotContains = 'notContains',
    In = 'in',
    NotIn = 'notIn',
}

const ORDERED_PRODUCTS_OPERATORS = ['contains', 'notContains', 'in', 'notIn']

export function isOrderedProductsOperators(
    operator: string
): operator is OrderedProductsOperators {
    return ORDERED_PRODUCTS_OPERATORS.includes(operator)
}
