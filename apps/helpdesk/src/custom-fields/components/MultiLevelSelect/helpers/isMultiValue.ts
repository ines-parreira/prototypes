import { CustomFieldValue } from 'custom-fields/types'

export function isMultiValue(
    values: CustomFieldValue | CustomFieldValue[] | undefined,
): values is Array<CustomFieldValue> {
    return Array.isArray(values) && values.length > 0
}

export function isMultiValueAllowed<T extends boolean | undefined>(
    allowMultiValues: T,
    __value: CustomFieldValue | CustomFieldValue[] | undefined,
): __value is CustomFieldValue[] {
    return allowMultiValues === true
}
