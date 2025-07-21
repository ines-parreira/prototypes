import {
    ExpressionFieldSource,
    ExpressionOperator,
} from '@gorgias/helpdesk-queries'

import { SUPPORTED_UI_DATA_TYPES } from 'custom-fields/constants'
import { SupportedUIDataType } from 'custom-fields/types'

export const EXPRESSION_OPERATORS_BY_UI_DATA_TYPE: Record<
    SupportedUIDataType,
    ExpressionOperator[]
> = {
    [SUPPORTED_UI_DATA_TYPES.INPUT_TEXT]: [
        ExpressionOperator.Is,
        ExpressionOperator.IsEmpty,
        ExpressionOperator.IsNotEmpty,
    ],
    [SUPPORTED_UI_DATA_TYPES.INPUT_NUMBER]: [
        ExpressionOperator.GreaterOrEqualTo,
        ExpressionOperator.LessOrEqualTo,
    ],
    [SUPPORTED_UI_DATA_TYPES.DROPDOWN_TEXT]: [
        ExpressionOperator.IsOneOf,
        ExpressionOperator.IsNotOneOf,
        ExpressionOperator.IsNotEmpty,
    ],
    [SUPPORTED_UI_DATA_TYPES.DROPDOWN_BOOLEAN]: [ExpressionOperator.Is],
}

export const EXPRESSION_OPERATORS_LABELS: Record<ExpressionOperator, string> = {
    [ExpressionOperator.Is]: 'is',
    [ExpressionOperator.IsNot]: 'is not',
    [ExpressionOperator.IsEmpty]: 'is empty',
    [ExpressionOperator.IsNotEmpty]: 'is not empty',
    [ExpressionOperator.GreaterOrEqualTo]: 'is greater or equal to',
    [ExpressionOperator.LessOrEqualTo]: 'is less or equal to',
    [ExpressionOperator.IsOneOf]: 'is one of',
    [ExpressionOperator.IsNotOneOf]: 'is not one of',
}

export const DEFAULT_EXPRESSION_RULE = {
    field_source: ExpressionFieldSource.TicketCustomFields,
    field: 0,
    operator: ExpressionOperator.Is,
    values: null,
}
