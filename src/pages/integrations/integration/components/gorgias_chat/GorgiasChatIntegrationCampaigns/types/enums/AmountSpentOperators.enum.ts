export enum AmountSpentOperators {
    GreaterThan = 'gt',
    GreaterOrEqual = 'gte',
    LessThan = 'lt',
    LessOrEqual = 'lte',
    Equal = 'eq',
    NotEqual = 'neq',
}

const AMOUNT_SPENT_OPERATORS = ['gt', 'gte', 'lt', 'lte', 'eq', 'neq']

export function isAmountSpentOperators(
    operator: string
): operator is AmountSpentOperators {
    return AMOUNT_SPENT_OPERATORS.includes(operator)
}
