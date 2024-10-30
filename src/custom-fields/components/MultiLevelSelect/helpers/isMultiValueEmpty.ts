import {isCustomFieldValueEmpty} from 'custom-fields/helpers/isCustomFieldValueEmpty'
import {CustomFieldValue} from 'custom-fields/types'

export default function isMultiValueEmpty(
    values: Array<CustomFieldValue> | undefined
) {
    return (
        !Array.isArray(values) ||
        values.length === 0 ||
        values.every(isCustomFieldValueEmpty)
    )
}
