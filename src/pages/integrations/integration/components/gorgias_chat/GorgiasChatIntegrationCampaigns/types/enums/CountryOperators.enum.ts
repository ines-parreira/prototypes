export enum CountryOperators {
    In = 'in',
    NotIn = 'notIn',
}

const OPERATORS_OPERATORS = ['in', 'notIn']

export function isCountryOperators(
    operator: string
): operator is CountryOperators {
    return OPERATORS_OPERATORS.includes(operator)
}
