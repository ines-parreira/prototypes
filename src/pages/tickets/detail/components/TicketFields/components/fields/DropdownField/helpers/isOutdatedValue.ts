import {CustomFieldValue} from 'models/customField/types'
import {isCustomFieldValueEmpty} from 'utils/customFields'

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
