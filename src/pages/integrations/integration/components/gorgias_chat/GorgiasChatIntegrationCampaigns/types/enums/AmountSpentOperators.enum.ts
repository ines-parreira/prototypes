export enum AmountSpentOperators {
    GreaterThan = 'gt',
    LessThan = 'lt',
    Equal = 'eq',
}

const AMOUNT_SPENT_OPERATORS = ['gt', 'lt', 'eq']

export function isAmountSpentOperators(
    operator: string
): operator is AmountSpentOperators {
    return AMOUNT_SPENT_OPERATORS.includes(operator)
}
