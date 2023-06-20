export enum OrdersCountOperators {
    GreaterThan = 'gt',
    GreaterOrEqual = 'gte',
    LessThan = 'lt',
    LessOrEqual = 'lte',
    Equal = 'eq',
    NotEqual = 'neq',
}

const ORDERS_COUNT_OPERATORS = ['gt', 'gte', 'lt', 'lte', 'eq', 'neq']

export function isOrdersCountOperators(
    operator: string
): operator is OrdersCountOperators {
    return ORDERS_COUNT_OPERATORS.includes(operator)
}
