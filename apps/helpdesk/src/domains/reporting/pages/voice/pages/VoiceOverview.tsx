import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { VoiceOverviewDownloadDataButton } from 'domains/reporting/pages/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import {
    CALL_ACTIVITY_TITLE,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import {
    VoiceOverviewChart,
    VoiceOverviewReportConfig,
} from 'domains/reporting/pages/voice/pages/VoiceOverviewReportConfig'
import VoicePaywall from 'domains/reporting/pages/voice/VoicePaywall'
import { ProductType } from 'models/billing/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import { AccountFeature } from 'state/currentAccount/types'

function VoiceOverview() {
    const isDuringBusinessHoursEnabled = useFlag(
        FeatureFlagKey.VoiceCallDuringBusinessHours,
    )

    useCleanStatsFilters()

    const reportComponents = [
        {
            chart: VoiceOverviewChart.VoiceCallVolumeTotalCallCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricOutboundCallsCountTrend,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricInboundCallsCountTrend,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricUnansweredCallsCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricMissedCallsCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricCancelledCallsCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricAbandonedCallsCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricCallbackRequestedCallsCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallCallerExperienceAverageWaitTimeChart,
            size: 6,
        },
        {
            chart: VoiceOverviewChart.VoiceCallCallerExperienceAverageTalkTime,
            size: 6,
        },
    ]

    return (
        <StatsPage
            title={VOICE_OVERVIEW_PAGE_TITLE}
            titleExtra={
                <>
                    <VoiceOverviewDownloadDataButton />
                </>
            }
        >
            <DashboardSection>
                <DashboardGridCell size={12} className="pb-0">
                    <FiltersPanelWrapper
                        persistentFilters={
                            VoiceOverviewReportConfig.reportFilters.persistent
                        }
                        optionalFilters={
                            isDuringBusinessHoursEnabled
                                ? VoiceOverviewReportConfig.reportFilters
                                      .optional
                                : VoiceOverviewReportConfig.reportFilters.optional.filter(
                                      (filter) =>
                                          filter !==
                                          FilterKey.IsDuringBusinessHours,
                                  )
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

            <DashboardSection>
                {reportComponents.map((reportComponent) => (
                    <DashboardGridCell
                        size={reportComponent.size}
                        key={reportComponent.chart}
                    >
                        <DashboardComponent
                            chart={reportComponent.chart}
                            config={VoiceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                ))}
            </DashboardSection>
            <DashboardSection title={CALL_ACTIVITY_TITLE}>
                <DashboardGridCell>
                    <DashboardComponent
                        chart={VoiceOverviewChart.VoiceCallTableChart}
                        config={VoiceOverviewReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <AnalyticsFooter />
        </StatsPage>
    )
}

export default withProductEnabledPaywall(
    ProductType.Voice,
    AccountFeature.PhoneNumber,
    VoicePaywall,
)(VoiceOverview)
