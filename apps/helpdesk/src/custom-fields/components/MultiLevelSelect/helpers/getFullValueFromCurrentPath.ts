import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import type { CustomFieldValue } from 'custom-fields/types'

const removeKeyMarkers = (path: string[]) => {
    return path.map(
        (key) => key.split(DROPDOWN_NESTING_DELIMITER).shift() ?? '',
    )
}

export function getFullValueFromCurrentPath(
    currentPath: string[],
    value: CustomFieldValue,
) {
    const path = removeKeyMarkers(currentPath)
    let fullValue = value
    if (typeof value === 'string') {
        fullValue = [...path, value].join(DROPDOWN_NESTING_DELIMITER)
    }

    return fullValue
}
