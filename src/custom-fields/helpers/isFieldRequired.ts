import {
    ExpressionFieldType,
    CustomFieldRequirementType,
} from '@gorgias/api-types'

import {CustomField} from 'custom-fields/types'

export const isFieldRequired = (
    fieldDefinition: CustomField,
    conditionalRequirementType?: ExpressionFieldType
): boolean => {
    return (
        fieldDefinition.required ||
        (fieldDefinition.requirement_type ===
            CustomFieldRequirementType.Conditional &&
            conditionalRequirementType === ExpressionFieldType.Required)
    )
}
