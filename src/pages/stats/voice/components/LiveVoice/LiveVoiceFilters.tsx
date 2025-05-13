import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { FilterComponentKey, FilterKey } from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'

export default function LiveVoiceFilters() {
    useCleanStatsFilters()

    return (
        <DashboardSection>
            <DashboardGridCell size={12}>
                <FiltersPanelWrapper
                    persistentFilters={[
                        FilterComponentKey.PhoneIntegrations,
                        FilterKey.Agents,
                        FilterKey.VoiceQueues,
                    ]}
                />
            </DashboardGridCell>
        </DashboardSection>
    )
}
