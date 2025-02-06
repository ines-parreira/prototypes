import {AI_MANAGED_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {activeParams} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'

export const useCustomFieldOutcome = () => {
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const customFieldOutcome = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_OUTCOME
    )

    return String(customFieldOutcome?.id || -1)
}
