import { DurationInMs } from '@repo/utils'

import type { CustomFieldCondition } from '@gorgias/helpdesk-queries'
import { useListCustomFieldConditions } from '@gorgias/helpdesk-queries'
import type { ObjectType } from '@gorgias/helpdesk-types'

export const MAX_CONDITIONS = 100 // The limit of conditions is 70, so we get the maximum of what API returns by default

type Params = {
    objectType: ObjectType
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
    const {
        data: { data: { data: customFieldConditions = [] } = {} } = {},
        isLoading,
        isError,
    } = useListCustomFieldConditions(
        {
            object_type: objectType,
            order_by: 'sort_order:asc',
            limit: MAX_CONDITIONS,
            include_deactivated: includeDeactivated,
        },
        {
            query: {
                staleTime: invalidate ? 0 : DurationInMs.OneHour,
                refetchOnWindowFocus: false,
                enabled: enabled,
            },
        },
    )

    return { customFieldConditions, isLoading, isError }
}
