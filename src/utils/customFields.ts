import {
    CustomField,
    CustomFields,
    CustomFieldState,
    CustomFieldValue,
} from 'models/customField/types'

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
