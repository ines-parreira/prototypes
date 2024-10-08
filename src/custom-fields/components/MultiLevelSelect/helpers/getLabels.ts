import {DROPDOWN_NESTING_DELIMITER} from 'custom-fields/constants'
import {CustomFieldValue} from 'custom-fields/types'
import {isCustomFieldValueEmpty} from 'custom-fields/helpers/isCustomFieldValueEmpty'

import {DROPDOWN_NESTING_FANCY_DELIMITER} from '../constants'

export function getLabel(choice?: CustomFieldValue) {
    if (isCustomFieldValueEmpty(choice)) return ''
    if (typeof choice === 'boolean') {
        return choice ? 'Yes' : 'No'
    }
    if (typeof choice === 'string') {
        return choice
            .split(DROPDOWN_NESTING_DELIMITER)
            .join(DROPDOWN_NESTING_FANCY_DELIMITER)
    }

    return choice.toString()
}

export function getStealthLabel(choice?: CustomFieldValue) {
    const _choice =
        typeof choice === 'string'
            ? (choice.split(DROPDOWN_NESTING_DELIMITER).pop() as string)
            : choice

    return getLabel(_choice)
}

export function getMultiLabel(choices?: CustomFieldValue[]) {
    return choices?.length
        ? choices.length >= 2
            ? `${choices.length} fields selected`
            : choices.map(getStealthLabel).join(', ')
        : ''
}
