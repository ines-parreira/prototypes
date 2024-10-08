import {DROPDOWN_NESTING_DELIMITER} from 'custom-fields/constants'
import {CustomFieldValue} from 'custom-fields/types'

export function getFullValueFromCurrentPath(
    currentPath: string[],
    value: CustomFieldValue
) {
    let fullValue = value
    if (typeof value === 'string') {
        fullValue = [...currentPath, value].join(DROPDOWN_NESTING_DELIMITER)
    }

    return fullValue
}
