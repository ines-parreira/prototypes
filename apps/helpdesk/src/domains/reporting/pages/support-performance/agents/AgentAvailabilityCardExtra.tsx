import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { isAdmin } from '@repo/utils'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AgentAvailabilityEditColumns } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityEditColumns'
import css from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra.less'
import { useAgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'

export const CANDU_ID = 'agent-availability-edit-table-toggle'

export const AgentAvailabilityCardExtra = () => {
    const currentUserMap = useAppSelector(getCurrentUser)
    const currentUser = currentUserMap?.toJS()
    const allAgents = useAppSelector(getFilteredAgents)
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { customStatuses } = useAgentAvailabilityData(
        allAgents,
        cleanStatsFilters,
        userTimezone,
    )

    const isReportingFilteringAndCalculationsTagsReportEnabled = useFlag(
        FeatureFlagKey.ReportingFilteringAndCalculationsTagsReport,
    )

    const canduId = isReportingFilteringAndCalculationsTagsReportEnabled
        ? CANDU_ID
        : undefined

    return (
        <div className={css.wrapper}>
            {currentUser && isAdmin(currentUser) && (
                <AgentAvailabilityEditColumns
                    canduId={canduId}
                    customStatuses={customStatuses}
                />
            )}
        </div>
    )
}
