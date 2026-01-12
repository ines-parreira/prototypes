import type {
    CustomFieldCondition,
    ExpressionFieldType,
} from '@gorgias/helpdesk-types'
import {
    ExpressionFieldSource,
    ExpressionOperator,
} from '@gorgias/helpdesk-types'

import type { TicketFieldsState } from '../store/useTicketFieldsStore'

export type CustomFieldConditionsEvaluationResults = Record<
    number,
    ExpressionFieldType | undefined
>

/**
 * Checks if a value is considered empty
 */
const isEmpty = (value: unknown): boolean => {
    if (Array.isArray(value)) {
        return value.length === 0
    }
    return value !== 0 && !value
}

/**
 * Evaluates a single operator expression against a value
 */
const evaluateOperator = (
    operator: ExpressionOperator,
    fieldValue: unknown,
    conditionValues: any[],
): boolean => {
    switch (operator) {
        case ExpressionOperator.IsEmpty:
            return isEmpty(fieldValue)
        case ExpressionOperator.IsNotEmpty:
            return !isEmpty(fieldValue)
        case ExpressionOperator.Is:
            return fieldValue === conditionValues[0]
        case ExpressionOperator.IsNot:
            return fieldValue !== conditionValues[0]
        case ExpressionOperator.GreaterOrEqualTo:
            return fieldValue != null && fieldValue >= conditionValues[0]
        case ExpressionOperator.LessOrEqualTo:
            return fieldValue != null && fieldValue <= conditionValues[0]
        case ExpressionOperator.IsOneOf:
            return conditionValues.includes(fieldValue)
        case ExpressionOperator.IsNotOneOf:
            return !conditionValues.includes(fieldValue)
    }
}

/**
 * Evaluates custom field conditions against custom field values
 *
 * Simplified to only evaluate custom field expressions.
 * Does not handle ticket properties (status, channel, etc.)
 *
 * @param conditions - Array of custom field conditions to evaluate
 * @param customFields - Map of field ID to field state (from Zustand store)
 * @returns Map of field IDs to their evaluated requirement type (Required or Visible)
 */
export const evaluateCustomFieldsConditions = (
    conditions: CustomFieldCondition[],
    customFields: TicketFieldsState,
): CustomFieldConditionsEvaluationResults => {
    const evaluationResults: CustomFieldConditionsEvaluationResults = {}

    for (const condition of conditions) {
        // Check if all expressions in the condition are satisfied
        const isApplicable = condition.expression.every((expression) => {
            // Only evaluate custom field expressions
            // Skip if expression references non-custom-field sources
            if (
                expression.field_source !==
                ExpressionFieldSource.TicketCustomFields
            ) {
                return true // Ignore non-custom-field expressions
            }

            const fieldId = expression.field as number
            const fieldState = customFields[fieldId]
            const fieldValue = fieldState?.value

            return evaluateOperator(
                expression.operator,
                fieldValue,
                expression.values ?? [],
            )
        })

        // If condition doesn't apply, skip its requirements
        if (!isApplicable) {
            continue
        }

        // Apply the requirements (mark fields as required or visible)
        for (const requirement of condition.requirements) {
            // Required takes precedence over visible
            if (evaluationResults[requirement.field_id] === 'required') {
                continue
            }

            evaluationResults[requirement.field_id] = requirement.type
        }
    }

    return evaluationResults
}
