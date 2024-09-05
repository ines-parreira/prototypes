import React from 'react'
import DashboardSection from 'pages/stats/DashboardSection'
import useAppSelector from 'hooks/useAppSelector'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {FilterComponentKey, FilterKey} from 'models/stat/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

export default function LiveVoiceFilters() {
    const pageStatsFilters = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )
    useCleanStatsFiltersWithLogicalOperators(pageStatsFilters)

    return (
        <DashboardSection>
            <DashboardGridCell size={12}>
                <FiltersPanel
                    persistentFilters={[
                        FilterComponentKey.PhoneIntegrations,
                        FilterKey.Agents,
                    ]}
                />
            </DashboardGridCell>
        </DashboardSection>
    )
}
