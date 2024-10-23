import React from 'react'
import DashboardSection from 'pages/stats/DashboardSection'
import useAppSelector from 'hooks/useAppSelector'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {FilterComponentKey, FilterKey} from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

export default function LiveVoiceFilters() {
    const pageStatsFilters = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
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
