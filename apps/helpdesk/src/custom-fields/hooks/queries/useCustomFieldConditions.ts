import { useEffect } from 'react'
import { Duration } from '@gorgias/toolkit'

import { toast } from '@gorgias/axiom'
import type { CustomFieldCondition } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useListCustomFieldConditions,
} from '@gorgias/helpdesk-queries'

import type { CustomFieldObjectTypes } from 'custom-fields/types'

export const STALE_TIME_MS = Duration.hours(1)
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
                staleTime: invalidate ? 0 : STALE_TIME_MS,
                queryKey:
                    queryKeys.customFieldConditions.listCustomFieldConditions({
                        object_type: objectType,
                        include_deactivated: includeDeactivated,
                    }),
                enabled: enabled,
            },
        },
    )

    useEffect(() => {
        if (isError) {
            toast.error('Failed to fetch ticket custom fields conditions')
        }
    }, [isError])

    return { customFieldConditions, isLoading, isError }
}
