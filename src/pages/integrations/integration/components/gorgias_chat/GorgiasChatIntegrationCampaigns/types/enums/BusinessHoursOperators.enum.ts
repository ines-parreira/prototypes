export enum BusinessHoursOperators {
    DuringHours = 'during',
    OutsideHours = 'outside',
    Anytime = 'anytime',
}

const BUSINESS_HOURS_OPERATORS = ['during', 'outside', 'anytime']

export function isBusinessHoursOperator(
    operator: string
): operator is BusinessHoursOperators {
    return BUSINESS_HOURS_OPERATORS.includes(operator)
}
