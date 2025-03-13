import React from 'react'

import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { FilterComponentKey, FilterKey } from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'

export default function LiveVoiceFilters() {
    useCleanStatsFilters()

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
