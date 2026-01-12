import type { CustomField } from '@gorgias/helpdesk-types'
import { ExpressionFieldType, RequirementType } from '@gorgias/helpdesk-types'

export const isFieldVisible = (
    fieldDefinition: CustomField,
    conditionalRequirementType?: ExpressionFieldType,
): boolean => {
    return (
        (fieldDefinition.required === false &&
            fieldDefinition.requirement_type !== RequirementType.Conditional) ||
        (fieldDefinition.requirement_type === RequirementType.Conditional &&
            conditionalRequirementType === ExpressionFieldType.Visible)
    )
}
