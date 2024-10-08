import {CustomFieldValue} from 'custom-fields/types'
import {isCustomFieldValueEmpty} from 'custom-fields/helpers/isCustomFieldValueEmpty'

export function isOutdatedValue(
    value: CustomFieldValue | undefined,
    choices: CustomFieldValue[]
) {
    return (
        !isCustomFieldValueEmpty(value) &&
        value !== undefined &&
        !choices.includes(value)
    )
}
