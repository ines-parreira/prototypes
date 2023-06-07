import {DROPDOWN_NESTING_DELIMITER} from 'models/customField/constants'
import {CustomFieldValue} from 'models/customField/types'

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
