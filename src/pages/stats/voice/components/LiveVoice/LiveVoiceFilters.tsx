import React from 'react'

import { useCleanStatsFiltersWithLogicalOperators } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { FilterComponentKey, FilterKey } from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'

export default function LiveVoiceFilters() {
    const pageStatsFilters = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )
    useCleanStatsFiltersWithLogicalOperators(pageStatsFilters)

    return (
        <DashboardSection>
            <DashboardGridCell size={12}>
                <FiltersPanelWrapper
                    persistentFilters={[
                        FilterComponentKey.PhoneIntegrations,
                        FilterKey.Agents,
                    ]}
                />
            </DashboardGridCell>
        </DashboardSection>
    )
}
