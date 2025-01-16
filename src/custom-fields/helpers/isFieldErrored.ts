import {ExpressionFieldType} from '@gorgias/api-types'

import {CustomField, CustomFieldState} from 'custom-fields/types'

import {isCustomFieldValueEmpty} from './isCustomFieldValueEmpty'
import {isFieldRequired} from './isFieldRequired'

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
            isCustomFieldValueEmpty(fieldState?.value)
    )
}
