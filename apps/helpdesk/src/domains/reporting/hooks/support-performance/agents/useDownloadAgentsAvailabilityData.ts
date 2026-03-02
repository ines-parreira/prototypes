import { useMemo } from 'react'

import type { User } from 'config/types/user'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useAgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData'
import { sortAgentAvailability } from 'domains/reporting/pages/support-performance/agents/sortAgentAvailability'
import { createAgentsAvailabilityReport } from 'domains/reporting/services/agentsAvailabilityReportingService'
import {
    getAgentSorting,
    getFilteredAgents,
} from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import useAppSelector from 'hooks/useAppSelector'

export const AGENTS_AVAILABILITY_REPORT_FILE_NAME =
    'agents-availability-metrics'

export const useDownloadAgentsAvailabilityData = () => {
    const allAgents = useAppSelector<User[]>(getFilteredAgents)
    const sorting = useAppSelector(getAgentSorting)
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const {
        agents: transformedAgents,
        customStatuses,
        isLoading,
    } = useAgentAvailabilityData(allAgents, cleanStatsFilters, userTimezone)

    const sortedAgents = useMemo(
        () => sortAgentAvailability(transformedAgents, sorting),
        [transformedAgents, sorting],
    )

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        AGENTS_AVAILABILITY_REPORT_FILE_NAME,
    )

    const { files } = useMemo(() => {
        if (isLoading || !sortedAgents.length) {
            return { files: {} }
        }

        return createAgentsAvailabilityReport(
            sortedAgents,
            customStatuses,
            fileName,
        )
    }, [sortedAgents, customStatuses, fileName, isLoading])

    return {
        files,
        fileName,
        isLoading,
    }
}
