import { useMemo } from 'react'

import { useListCustomUserAvailabilityStatuses } from '@gorgias/helpdesk-queries'

import {
    CUSTOM_UNAVAILABILITY_STATUS_LIMIT,
    SYSTEM_STATUSES,
} from '../constants'
import type { AgentStatusWithSystem } from '../types'

export const useAgentStatuses = () => {
    const queryResult = useListCustomUserAvailabilityStatuses()
    const { data, isLoading } = queryResult
    const tableData = useMemo(() => data?.data.data || [], [data])

    const allStatuses = useMemo<AgentStatusWithSystem[]>(() => {
        const customStatuses: AgentStatusWithSystem[] = tableData.map(
            (status) => ({
                ...status,
                is_system: false,
            }),
        )

        return [...SYSTEM_STATUSES, ...customStatuses]
    }, [tableData])

    const hasReachedCreateLimit = useMemo(() => {
        return tableData.length >= CUSTOM_UNAVAILABILITY_STATUS_LIMIT
    }, [tableData.length])

    return {
        ...queryResult,
        data: allStatuses,
        isLoading,
        hasReachedCreateLimit,
    }
}
