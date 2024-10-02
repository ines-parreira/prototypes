import {fromJS, Map} from 'immutable'

import {CustomField} from 'models/customField/types'

export const mockCustomField = {
    definition: {
        data_type: 'text',
        input_settings: {input_type: 'input'},
    },
} as CustomField

export const mockSchemas = (fromJS({}) as Map<any, any>).setIn(
    [
        'definitions',
        'Ticket',
        'properties',
        'custom_fields',
        'meta',
        'operators',
        'text',
        'eq',
        'label',
    ],
    'is'
)
