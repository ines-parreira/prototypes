import { CustomFieldDefinition } from '@gorgias/helpdesk-types'

import { ExhaustiveUIDataType } from 'custom-fields/types'

export function getUIDataType(
    dataType: CustomFieldDefinition['data_type'],
    inputType: CustomFieldDefinition['input_settings']['input_type'],
): ExhaustiveUIDataType {
    return `${inputType}_${dataType}`
}
