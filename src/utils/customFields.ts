import {
    CustomField,
    CustomFieldState,
    NormalizedCustomFieldState,
} from 'models/customField/types'

// this empty check will need to be more elaborate
// in the future as more types kick in
export function isCustomFieldValueEmpty(value: CustomFieldState['value']) {
    return typeof value !== 'number' && !value
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
    fieldsState: NormalizedCustomFieldState
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
