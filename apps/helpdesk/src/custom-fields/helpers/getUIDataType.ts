import type { CustomField } from '@gorgias/helpdesk-types'

import type { ExhaustiveUIDataType } from 'custom-fields/types'

export function getUIDataType(
    dataType: CustomField['definition']['data_type'],
    inputType: CustomField['definition']['input_settings']['input_type'],
): ExhaustiveUIDataType {
    return `${inputType}_${dataType}`
}
