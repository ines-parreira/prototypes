import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { WithSlaEmptyState } from 'domains/reporting/pages/sla/components/WithSlaEmptyState'
import {
    VoiceServiceLevelAgreementsChart,
    VoiceServiceLevelAgreementsReportConfig,
} from 'domains/reporting/pages/sla/voice/VoiceServiceLevelAgreementsReportConfig'

const OVERVIEW_SECTION_LABEL = 'Overview'

export function VoiceServiceLevelAgreements() {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    return (
        <WithSlaEmptyState>
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <FiltersPanelWrapper
                        persistentFilters={
                            VoiceServiceLevelAgreementsReportConfig
                                .reportFilters.persistent
                        }
                        optionalFilters={
                            VoiceServiceLevelAgreementsReportConfig
                                .reportFilters.optional
                        }
                        filterSettingsOverrides={{
                            [FilterKey.Period]: {
                                initialSettings: {
                                    maxSpan: 365,
                                },
                            },
                        }}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title={OVERVIEW_SECTION_LABEL} className="pb-0">
                <DashboardGridCell size={12}>
                    <DashboardComponent
                        chart={
                            VoiceServiceLevelAgreementsChart.AchievedAndBreachedVoiceCallsChart
                        }
                        config={VoiceServiceLevelAgreementsReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <AnalyticsFooter />
        </WithSlaEmptyState>
    )
}
