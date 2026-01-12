import type { CustomField, ExpressionFieldType } from '@gorgias/helpdesk-types'

import { isCustomFieldValueEmpty } from '../../../../InfobarCustomerFields/utils'
import type { CustomFieldState } from '../store/useTicketFieldsStore'
import { isFieldRequired } from './isFieldRequired'

export function isFieldErrored({
    fieldState,
    fieldDefinition,
    conditionalRequirementType,
}: {
    fieldState?: CustomFieldState
    fieldDefinition: CustomField
    conditionalRequirementType?: ExpressionFieldType
}) {
    return Boolean(
        isFieldRequired(fieldDefinition, conditionalRequirementType) &&
            isCustomFieldValueEmpty(fieldState?.value),
    )
}
