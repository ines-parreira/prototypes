import React from 'react'
import DashboardSection from 'pages/stats/DashboardSection'
import {IntegrationsFilter} from 'pages/stats/common/filters/IntegrationsFilter'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import AgentsFilter from 'pages/stats/common/filters/AgentsFilter'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {getPageStatsFilters} from 'state/stats/selectors'

export default function LiveVoiceFilters() {
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const {cleanStatsFilters} = useAppSelector(getCleanStatsFiltersWithTimezone)
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    useCleanStatsFilters(pageStatsFilters)

    return (
        <DashboardSection>
            <IntegrationsFilter
                value={withDefaultLogicalOperator(
                    cleanStatsFilters.integrations
                )}
                integrations={phoneIntegrations}
            />
            <AgentsFilter
                value={withDefaultLogicalOperator(pageStatsFilters.agents)}
            />
        </DashboardSection>
    )
}
