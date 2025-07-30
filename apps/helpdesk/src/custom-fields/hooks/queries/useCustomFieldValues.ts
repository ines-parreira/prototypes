import { useGetCustomFieldValues } from 'custom-fields/hooks/queries/queries'
import { CustomFieldObjectTypes } from 'custom-fields/types'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

export const useCustomFieldValues = (params: {
    object_type: CustomFieldObjectTypes
    holderId: number
}) => {
    return useGetCustomFieldValues(params, {
        staleTime: STALE_TIME_MS,
        select: (data) => data.data,
        meta: {
            errorMessage: 'Failed to fetch custom field values',
        },
    })
}
