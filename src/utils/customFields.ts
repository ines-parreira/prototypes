import {
    CustomField,
    CustomFields,
    CustomFieldState,
    CustomFieldValue,
} from 'models/customField/types'
import {Macro} from 'models/macro/types'
import {MacroActionName} from 'models/macroAction/types'

// this empty check will need to be more elaborate
// in the future as more types kick in
export function isCustomFieldValueEmpty(
    value?: CustomFieldValue
): value is undefined | '' {
    return typeof value !== 'number' && typeof value !== 'boolean' && !value
}

export function isFieldErrored({
    fieldState,
    fieldDefinition,
}: {
    fieldState?: CustomFieldState
    fieldDefinition?: CustomField
}) {
    return Boolean(
        fieldDefinition?.required && isCustomFieldValueEmpty(fieldState?.value)
    )
}

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
