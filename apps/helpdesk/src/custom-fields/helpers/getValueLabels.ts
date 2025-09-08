import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import { isCustomFieldValueEmpty } from 'custom-fields/helpers/isCustomFieldValueEmpty'
import { CustomFieldValue } from 'custom-fields/types'

import { DROPDOWN_NESTING_FANCY_DELIMITER } from '../components/MultiLevelSelect/constants'

export function getValueLabel(value?: CustomFieldValue | CustomFieldValue[]) {
    if (!Array.isArray(value) && isCustomFieldValueEmpty(value)) return ''
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No'
    }
    if (typeof value === 'string') {
        return value
            .split(DROPDOWN_NESTING_DELIMITER)
            .join(DROPDOWN_NESTING_FANCY_DELIMITER)
    }
    if (Array.isArray(value)) {
        return value
            .map((item) =>
                item
                    .toString()
                    .split(DROPDOWN_NESTING_DELIMITER)
                    .join(DROPDOWN_NESTING_FANCY_DELIMITER),
            )
            .join(',')
    }

    return value.toString()
}

export function getShortValueLabel(value?: CustomFieldValue) {
    const _value =
        typeof value === 'string'
            ? (value.split(DROPDOWN_NESTING_DELIMITER).pop() as string)
            : value

    return getValueLabel(_value)
}
