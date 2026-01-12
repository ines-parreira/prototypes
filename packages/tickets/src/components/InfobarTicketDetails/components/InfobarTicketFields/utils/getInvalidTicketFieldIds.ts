import type { CustomField } from '@gorgias/helpdesk-types'

import type { TicketFieldsState } from '../store/useTicketFieldsStore'
import type { CustomFieldConditionsEvaluationResults } from './evaluateCustomFieldsConditions'
import { isFieldErrored } from './isFieldErrored'

export function getInvalidTicketFieldIds({
    fields,
    fieldDefinitions,
    evaluationResults,
}: {
    fields: TicketFieldsState
    fieldDefinitions: CustomField[]
    evaluationResults: CustomFieldConditionsEvaluationResults
}): number[] {
    const invalidFieldIds: number[] = []

    fieldDefinitions.forEach((fieldDefinition) => {
        const fieldState = fields[fieldDefinition.id]

        if (
            isFieldErrored({
                fieldState,
                fieldDefinition,
                conditionalRequirementType:
                    evaluationResults[fieldDefinition.id],
            })
        ) {
            invalidFieldIds.push(fieldDefinition.id)
        }
    })

    return invalidFieldIds
}
