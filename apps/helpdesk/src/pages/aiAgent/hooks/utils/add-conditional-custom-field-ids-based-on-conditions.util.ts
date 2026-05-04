import type { CustomFieldCondition } from '@gorgias/helpdesk-types'

import type { CustomField } from 'custom-fields/types'

export function populateConditionalFieldIds(
    accountCustomFieldConditions: CustomFieldCondition[],
    formValueCustomFieldIds: CustomField['id'][],
): CustomField['id'][] {
    const conditionalCustomFieldIds = new Set<CustomField['id']>()
    accountCustomFieldConditions.forEach((condition) => {
        const conditionHasStoreConfigurationCustomField =
            condition.expression.find((expression) =>
                formValueCustomFieldIds.includes(Number(expression.field)),
            )

        if (conditionHasStoreConfigurationCustomField) {
            condition.requirements.forEach((field) =>
                conditionalCustomFieldIds.add(field.field_id),
            )
        }
    })

    return Array.from(conditionalCustomFieldIds)
}
