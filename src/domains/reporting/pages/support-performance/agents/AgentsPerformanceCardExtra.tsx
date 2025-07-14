import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { AgentPerformanceHeatmapSwitch } from 'domains/reporting/pages/support-performance/agents/AgentPerformanceHeatmapSwitch'
import { AgentsEditColumns } from 'domains/reporting/pages/support-performance/agents/AgentsEditColumns'
import css from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra.less'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export const CANDU_ID = 'agents-performance-edit-table-toggle'

export const AgentsPerformanceCardExtra = () => {
    const currentUser = useAppSelector(getCurrentUser)

    const featureFlags = useFlags()
    const isReportingFilteringAndCalculationsTagsReportEnabled =
        !!featureFlags[
            FeatureFlagKey.ReportingFilteringAndCalculationsTagsReport
        ]

    const canduId = isReportingFilteringAndCalculationsTagsReportEnabled
        ? CANDU_ID
        : undefined

    return (
        <div className={css.wrapper}>
            {hasRole(currentUser, UserRole.Admin) && (
                <AgentsEditColumns canduId={canduId} />
            )}
            <AgentPerformanceHeatmapSwitch />
        </div>
    )
}
