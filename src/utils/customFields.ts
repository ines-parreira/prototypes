import { Macro } from '@gorgias/api-queries'

import { isFieldErrored } from 'custom-fields/helpers/isFieldErrored'
import {
    CustomField,
    CustomFieldConditionsEvaluationResults,
    CustomFields,
    CustomFieldState,
} from 'custom-fields/types'
import { MacroAction, MacroActionName } from 'models/macroAction/types'

export function getInvalidTicketFieldIds({
    fieldsState,
    fieldDefinitions,
    evaluatedConditions,
}: {
    fieldsState: CustomFields
    fieldDefinitions: CustomField[]
    evaluatedConditions: CustomFieldConditionsEvaluationResults
}) {
    const erroredCustomFields: CustomFieldState['id'][] = []
    fieldDefinitions.forEach((fieldDefinition) => {
        const fieldState = fieldsState[fieldDefinition.id]
        if (
            isFieldErrored({
                fieldState,
                fieldDefinition,
                conditionalRequirementType:
                    evaluatedConditions[fieldDefinition.id],
            })
        ) {
            erroredCustomFields.push(fieldDefinition.id)
        }
    })
    return erroredCustomFields
}

export function mergeFieldsStateWithMacroValues({
    fieldsState,
    appliedMacro,
}: {
    fieldsState: CustomFields
    appliedMacro: Macro
}) {
    const ticketFieldsWithMacro: CustomFields = { ...fieldsState }

    ;(appliedMacro.actions as MacroAction[])?.forEach((action) => {
        if (
            action.name === MacroActionName.SetCustomFieldValue &&
            action.arguments.value !== ''
        ) {
            const customFieldId = action.arguments.custom_field_id
            if (customFieldId) {
                ticketFieldsWithMacro[customFieldId] = {
                    ...fieldsState[customFieldId],
                    value: action.arguments.value,
                }
            }
        }
    })

    return ticketFieldsWithMacro
}
