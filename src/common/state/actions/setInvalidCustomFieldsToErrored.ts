import {CustomFieldState} from 'models/customField/types'

import {SET_INVALID_CUSTOM_FIELDS_TO_ERRORED} from '../constants'

export default function setInvalidCustomFieldsToErrored(
    erroredCustomFields: CustomFieldState['id'][]
) {
    return {
        type: SET_INVALID_CUSTOM_FIELDS_TO_ERRORED,
        payload: erroredCustomFields,
    }
}
