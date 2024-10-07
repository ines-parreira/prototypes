import {CustomField, CustomFieldState} from 'custom-fields/types'
import {isCustomFieldValueEmpty} from './isCustomFieldValueEmpty'

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
