import {
    CustomFieldCondition,
    queryKeys,
    useListCustomFieldConditions,
} from '@gorgias/api-queries'

import { CustomFieldObjectTypes } from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour
export const MAX_CONDITIONS = 100 // The limit of conditions is 70, so we get the maximum of what API returns by default

type Params = {
    objectType: CustomFieldObjectTypes
    includeDeactivated?: boolean
    enabled?: boolean
    invalidate?: boolean
}

export const useCustomFieldConditions = ({
    objectType,
    includeDeactivated = true,
    enabled = true,
    invalidate = false,
}: Params): {
    customFieldConditions: CustomFieldCondition[]
    isLoading: boolean
    isError: boolean
} => {
    const dispatch = useAppDispatch()

    const {
        data: { data: { data: customFieldConditions = [] } = {} } = {},
        isLoading,
        isError,
    } = useListCustomFieldConditions({
        http: {
            params: {
                object_type: objectType,
                order_by: 'sort_order:asc',
                limit: MAX_CONDITIONS,
                include_deactivated: includeDeactivated,
            },
        },
        query: {
            staleTime: invalidate ? 0 : STALE_TIME_MS,
            queryKey: queryKeys.customFieldConditions.listCustomFieldConditions(
                {
                    object_type: objectType,
                    include_deactivated: includeDeactivated,
                },
            ),
            enabled: enabled,
        },
    })

    if (isError) {
        void dispatch(
            notify({
                message: 'Failed to fetch ticket custom fields conditions',
                status: NotificationStatus.Error,
            }),
        )
    }

    return { customFieldConditions, isLoading, isError }
}
