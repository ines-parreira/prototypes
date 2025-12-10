// Migrated from: apps/helpdesk/src/custom-fields/helpers/getNumberOrUndefined.ts
import type { CustomFieldValue } from '../types'
import { isCustomFieldValueEmpty } from './isCustomFieldValueEmpty'

export function getNumberOrUndefined(
    value?: CustomFieldValue,
): number | undefined {
    if (isCustomFieldValueEmpty(value)) return undefined
    if (typeof value !== 'number' && typeof value !== 'string') return undefined
    return Number(value)
}
