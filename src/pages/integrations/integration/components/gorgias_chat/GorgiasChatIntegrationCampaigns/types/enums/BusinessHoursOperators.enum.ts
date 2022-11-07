export enum BusinessHoursOperators {
    DuringHours = 'during',
    OutsideHours = 'outside',
}

const BUSINESS_HOURS_OPERATORS = ['during', 'outside']

export function isBusinessHoursOperator(
    operator: string
): operator is BusinessHoursOperators {
    return BUSINESS_HOURS_OPERATORS.includes(operator)
}
