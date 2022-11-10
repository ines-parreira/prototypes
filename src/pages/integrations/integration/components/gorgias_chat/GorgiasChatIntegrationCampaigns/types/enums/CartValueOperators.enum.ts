export enum CartValueOperators {
    GreaterThan = 'gt',
    LessThan = 'lt',
    Equal = 'eq',
}

const CART_VALUE_OPERATORS = ['gt', 'lt', 'eq']

export function isCartValueOperators(
    operator: string
): operator is CartValueOperators {
    return CART_VALUE_OPERATORS.includes(operator)
}
