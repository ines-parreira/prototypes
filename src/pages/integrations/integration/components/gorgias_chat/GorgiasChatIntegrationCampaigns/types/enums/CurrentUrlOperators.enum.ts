export enum CurrentUrlOperators {
    Equal = 'eq',
    NotEqual = 'neq',
    Contains = 'contains',
    NotContains = 'notContains',
    StartsWith = 'startsWith',
    EndsWith = 'endsWith',
}

const CURRENT_URL_OPERATORS = [
    'eq',
    'neq',
    'contains',
    'notContains',
    'startsWith',
    'endsWith',
]

export function isCurrentUrlOperators(
    operator: string
): operator is CurrentUrlOperators {
    return CURRENT_URL_OPERATORS.includes(operator)
}
