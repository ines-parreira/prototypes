import type { CustomField } from '@gorgias/helpdesk-types'
import { ExpressionFieldType, RequirementType } from '@gorgias/helpdesk-types'

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
