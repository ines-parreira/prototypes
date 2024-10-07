import {CustomFieldValue} from 'custom-fields/types'

// this empty check will need to be more elaborate
// in the future as more types kick in
export function isCustomFieldValueEmpty(
    value?: CustomFieldValue
): value is undefined | '' {
    return typeof value !== 'number' && typeof value !== 'boolean' && !value
}
