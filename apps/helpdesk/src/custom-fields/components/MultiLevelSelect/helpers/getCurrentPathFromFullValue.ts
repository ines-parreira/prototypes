import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import type { CustomFieldValue } from 'custom-fields/types'

import { branchKey } from './buildTreeOfChoices'

export function getCurrentPathFromFullValue(
    value: CustomFieldValue | undefined,
) {
    return typeof value === 'string' &&
        value.includes(DROPDOWN_NESTING_DELIMITER)
        ? value.split(DROPDOWN_NESTING_DELIMITER).slice(0, -1).map(branchKey)
        : []
}
