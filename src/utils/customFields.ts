import {isFieldErrored} from 'custom-fields/helpers/isFieldErrored'
import {CustomField, CustomFields, CustomFieldState} from 'custom-fields/types'
import {Macro} from 'models/macro/types'
import {MacroActionName} from 'models/macroAction/types'

export function getInvalidTicketFieldIds({
    fieldsState,
    fieldDefinitions,
}: {
    fieldsState: CustomFields
    fieldDefinitions: CustomField[]
}) {
    const erroredCustomFields: CustomFieldState['id'][] = []
    fieldDefinitions.forEach((fieldDefinition) => {
        const fieldState = fieldsState[fieldDefinition.id]
        if (isFieldErrored({fieldDefinition, fieldState}))
            erroredCustomFields.push(fieldDefinition.id)
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
    const ticketFieldsWithMacro: CustomFields = {...fieldsState}

    appliedMacro.actions?.forEach((action) => {
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
