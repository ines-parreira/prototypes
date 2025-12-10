import type { CustomFieldValue } from '../types'

export function isCustomFieldValueEmpty(
    value?: CustomFieldValue,
): value is undefined | '' {
    return (
        (typeof value !== 'number' && typeof value !== 'boolean' && !value) ||
        (typeof value === 'number' && Number.isNaN(Number(value)))
    )
}
