import {DROPDOWN_NESTING_DELIMITER} from '../constants'

export function getFullValueFromCurrentPath(
    currentPath: string[],
    value: string
) {
    let fullValue = value
    if (typeof value === 'string') {
        fullValue = [...currentPath, value].join(DROPDOWN_NESTING_DELIMITER)
    }

    return fullValue
}
