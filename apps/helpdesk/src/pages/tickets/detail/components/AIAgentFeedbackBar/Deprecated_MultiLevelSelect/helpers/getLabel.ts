import {
    DROPDOWN_NESTING_DELIMITER,
    DROPDOWN_NESTING_FANCY_DELIMITER,
} from '../constants'

export function getLabel(choice?: string) {
    if (!choice) return ''
    return choice
        .split(DROPDOWN_NESTING_DELIMITER)
        .join(DROPDOWN_NESTING_FANCY_DELIMITER)
}
