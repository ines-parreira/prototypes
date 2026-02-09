import { useMemo } from 'react'

import { DurationInMs } from '@repo/utils'

import { useListCustomUserAvailabilityStatuses } from '@gorgias/helpdesk-queries'

import { PREDEFINED_SELECTABLE_STATUSES } from '../constants'
import type { AgentStatusWithSystem } from '../types'

export const useSelectableAgentAvailabilityStatuses = () => {
    const queryResult = useListCustomUserAvailabilityStatuses({
        query: {
            cacheTime: DurationInMs.OneDay,
            staleTime: DurationInMs.FiveMinutes,
        },
    })
    const { data, isLoading, isError } = queryResult
    const tableData = useMemo(() => data?.data.data || [], [data])

    const allStatuses = useMemo<AgentStatusWithSystem[]>(() => {
        const customStatuses: AgentStatusWithSystem[] = tableData.map(
            (status) => ({
                ...status,
                is_system: false,
            }),
        )

        return [...PREDEFINED_SELECTABLE_STATUSES, ...customStatuses]
    }, [tableData])

    return {
        allStatuses,
        isLoading,
        isError,
    }
}
