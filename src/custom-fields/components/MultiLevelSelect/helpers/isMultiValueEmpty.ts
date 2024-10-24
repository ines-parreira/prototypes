import {isCustomFieldValueEmpty} from 'custom-fields/helpers/isCustomFieldValueEmpty'
import {CustomFieldValue} from 'custom-fields/types'

export default function isMultiValueEmpty(
    values: unknown
): values is CustomFieldValue[] {
    return (
        !Array.isArray(values) ||
        values.length === 0 ||
        values.every(isCustomFieldValueEmpty)
    )
}
