import {CustomFieldValue} from 'custom-fields/types'

export function isMultiValue(
    values: CustomFieldValue | CustomFieldValue[] | undefined
): values is Array<CustomFieldValue> {
    return Array.isArray(values) && values.length > 0
}
