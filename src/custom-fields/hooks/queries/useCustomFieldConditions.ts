import {
    CustomFieldCondition,
    useListCustomFieldConditions,
    queryKeys,
} from '@gorgias/api-queries'

import {CustomFieldObjectTypes} from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour
const MAX_CONDITIONS = 100 // The limit of conditions is 70, so we get the maximum of what API returns by default

export const useCustomFieldConditions = (
    objectType: CustomFieldObjectTypes,
    enabled: boolean = true
): {
    customFieldConditions: CustomFieldCondition[]
    isLoading: boolean
} => {
    const dispatch = useAppDispatch()

    const {
        data: {data: {data: customFieldConditions = []} = {}} = {},
        isLoading,
        isError,
    } = useListCustomFieldConditions({
        http: {
            params: {
                object_type: objectType,
                order_by: 'sort_order:asc',
                limit: MAX_CONDITIONS,
            },
        },
        query: {
            staleTime: STALE_TIME_MS,
            queryKey: queryKeys.customFieldConditions.listCustomFieldConditions(
                {object_type: objectType}
            ),
            enabled: enabled,
        },
    })

    if (isError) {
        void dispatch(
            notify({
                message: 'Failed to fetch ticket custom fields conditions',
                status: NotificationStatus.Error,
            })
        )
    }

    return {customFieldConditions, isLoading}
}
