import { ExpressionFieldType, RequirementType } from '@gorgias/api-types'

import { CustomField } from 'custom-fields/types'

export const isFieldRequired = (
    fieldDefinition: CustomField,
    conditionalRequirementType?: ExpressionFieldType,
): boolean => {
    return (
        fieldDefinition.required ||
        (fieldDefinition.requirement_type === RequirementType.Conditional &&
            conditionalRequirementType === ExpressionFieldType.Required)
    )
}
