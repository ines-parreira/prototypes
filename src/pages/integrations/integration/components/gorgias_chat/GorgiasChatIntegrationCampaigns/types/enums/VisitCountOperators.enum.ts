export enum VisitCountOperators {
    GreaterThan = 'gt',
    LessThan = 'lt',
    Equal = 'eq',
}

const VISIT_COUNT_OPERATORS = ['gt', 'lt', 'eq']

export function isVisitCountOperators(
    operator: string
): operator is VisitCountOperators {
    return VISIT_COUNT_OPERATORS.includes(operator)
}
