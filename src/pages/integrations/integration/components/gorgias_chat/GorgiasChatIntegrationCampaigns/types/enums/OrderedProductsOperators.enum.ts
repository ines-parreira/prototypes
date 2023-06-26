export enum OrderedProductsOperators {
    ContainsAll = 'containsAll',
    ContainsAny = 'containsAny',
    NotContains = 'notContains',
}

const ORDERED_PRODUCTS_OPERATORS = ['containsAll', 'containsAny', 'notContains']

export function isOrderedProductsOperators(
    operator: string
): operator is OrderedProductsOperators {
    return ORDERED_PRODUCTS_OPERATORS.includes(operator)
}
