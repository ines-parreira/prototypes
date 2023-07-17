export enum OrdersCountOperators {
    GreaterThan = 'gt',
    LessThan = 'lt',
    Equal = 'eq',
}

const ORDERS_COUNT_OPERATORS = ['gt', 'lt', 'eq']

export function isOrdersCountOperators(
    operator: string
): operator is OrdersCountOperators {
    return ORDERS_COUNT_OPERATORS.includes(operator)
}
