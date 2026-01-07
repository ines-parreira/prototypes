import { useMemo } from 'react'

import { useListCustomUserAvailabilityStatuses } from '@gorgias/helpdesk-queries'

import { SYSTEM_STATUSES } from '../constants'
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

    return {
        ...queryResult,
        data: allStatuses,
        isLoading,
    }
}
