import {
    CustomFieldCondition,
    ExpressionFieldType,
    ExpressionFieldSource,
    ExpressionOperator,
} from '@gorgias/api-types'

import {OBJECT_TYPES} from 'custom-fields/constants'

import {
    CustomFieldObjectTypes,
    CustomFieldConditionsEvaluationResults,
} from 'custom-fields/types'

import resolveTicketPropertyValue from './resolveTicketPropertyValue'

type PropertyResolver = (
    _: any,
    source: ExpressionFieldSource,
    property: any
) => any

const isEmpty = (value: unknown) => {
    if (Array.isArray(value)) {
        return value.length === 0 // Return true if it's an empty array
    }

    // TODO: We might want to find a way to reuse
    // `isCustomFieldValueEmpty` exclusively for ticket fields
    // here be cause check could easily diverge
    return value !== 0 && !value
}

const evaluateOperator = (
    operator: ExpressionOperator,
    sourceValue: unknown,
    values: any[]
): boolean => {
    switch (operator) {
        case ExpressionOperator.IsEmpty:
            return isEmpty(sourceValue)
        case ExpressionOperator.IsNotEmpty:
            return !isEmpty(sourceValue)
        case ExpressionOperator.Is:
            return sourceValue === values[0]
        case ExpressionOperator.IsNot:
            return sourceValue !== values[0]

        case ExpressionOperator.GreaterOrEqualTo:
            return sourceValue != null && sourceValue >= values[0]

        case ExpressionOperator.LessOrEqualTo:
            return sourceValue != null && sourceValue <= values[0]

        case ExpressionOperator.IsOneOf:
            return values.includes(sourceValue)
        case ExpressionOperator.IsNotOneOf:
            return !values.includes(sourceValue)
    }
}

export const evaluateCustomFieldsConditions = (
    conditions: CustomFieldCondition[],
    objectType: CustomFieldObjectTypes,
    sourceObject: Record<string, unknown>
): CustomFieldConditionsEvaluationResults => {
    let resolveObjectProperty: PropertyResolver
    if (objectType === OBJECT_TYPES.TICKET) {
        resolveObjectProperty = resolveTicketPropertyValue
    } else {
        throw new Error(`Unsupported object type: ${objectType}`)
    }

    const customFieldConditionsEvaluationResults: CustomFieldConditionsEvaluationResults =
        {}

    for (const condition of conditions) {
        const isApplicable = condition.expression.every((expression) => {
            return evaluateOperator(
                expression.operator,
                resolveObjectProperty(
                    sourceObject,
                    expression.field_source,
                    expression.field as string
                ),
                expression.values ?? []
            )
        })

        if (!isApplicable) {
            continue
        }

        for (const requirement of condition.requirements) {
            if (
                customFieldConditionsEvaluationResults[requirement.field_id] ===
                ExpressionFieldType.Required
            ) {
                continue
            }

            customFieldConditionsEvaluationResults[requirement.field_id] =
                requirement.type
        }
    }

    return customFieldConditionsEvaluationResults
}
