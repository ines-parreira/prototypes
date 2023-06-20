export enum CountryOperators {
    Contains = 'contains',
    NotContains = 'notContains',
    In = 'in',
    NotIn = 'notIn',
}

const OPERATORS_OPERATORS = ['contains', 'notContains', 'in', 'notIn']

export function isCountryOperators(
    operator: string
): operator is CountryOperators {
    return OPERATORS_OPERATORS.includes(operator)
}
