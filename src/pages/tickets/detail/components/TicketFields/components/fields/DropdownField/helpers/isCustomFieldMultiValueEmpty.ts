import {CustomFieldValue} from 'models/customField/types'
import {isCustomFieldValueEmpty} from 'utils/customFields'

export default function isCustomFieldMultiValueEmpty(
    values: unknown
): values is CustomFieldValue[] {
    return (
        !Array.isArray(values) ||
        values.length === 0 ||
        values.every(isCustomFieldValueEmpty)
    )
}
