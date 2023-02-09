import {CustomFieldState} from 'models/customField/types'

// this empty check will need to be more elaborate
// in the future as more types kick in
export function isCustomFieldValueEmpty(value: CustomFieldState['value']) {
    return typeof value !== 'number' && !value
}
