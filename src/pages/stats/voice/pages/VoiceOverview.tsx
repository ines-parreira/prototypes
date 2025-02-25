import React, { useMemo } from 'react'

import moment from 'moment/moment'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useCleanStatsFiltersWithLogicalOperators } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import { FilterKey } from 'models/stat/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import DEPRECATED_AgentsStatsFilter from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import DEPRECATED_PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import { CustomReportComponent } from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { VoiceOverviewDownloadDataButton } from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import {
    CALL_ACTIVITY_TITLE,
    CALL_VOLUME_METRICS_TITLE,
    CALLER_EXPERIENCE_METRICS_TITLE,
    MIN_DATE_FOR_VOICE_STATS,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {
    VoiceOverviewChart,
    VoiceOverviewReportConfig,
} from 'pages/stats/voice/pages/VoiceOverviewReportConfig'
import VoicePaywall from 'pages/stats/voice/VoicePaywall'
import { AccountFeature } from 'state/currentAccount/types'
import { getPhoneIntegrations } from 'state/integrations/selectors'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { getCleanStatsFiltersWithTimezone } from 'state/ui/stats/selectors'

function VoiceOverview() {
    const shouldShowNewUnansweredStatuses = useFlag(
        FeatureFlagKey.ShowNewUnansweredStatuses,
    )

    const { isAnalyticsNewFilters } = useNewVoiceStatsFilters()

    const { cleanStatsFilters: legacyStatsFilters } = useAppSelector(
        getCleanStatsFiltersWithTimezone,
    )

    const phoneIntegrations = useAppSelector(getPhoneIntegrations)

    const pageStatsFilters = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )
    useCleanStatsFiltersWithLogicalOperators(pageStatsFilters)

    const voiceFilters = useMemo(
        () =>
            !isAnalyticsNewFilters ? (
                <>
                    <DEPRECATED_IntegrationsStatsFilter
                        value={pageStatsFilters.integrations?.values}
                        integrations={phoneIntegrations}
                        isMultiple
                        variant={'ghost'}
                    />
                    <DEPRECATED_TagsStatsFilter
                        value={legacyStatsFilters.tags}
                        variant={'ghost'}
                    />
                    <DEPRECATED_AgentsStatsFilter
                        value={pageStatsFilters.agents?.values}
                        variant={'ghost'}
                    />
                    <DEPRECATED_PeriodStatsFilter
                        initialSettings={{
                            minDate: moment(
                                MIN_DATE_FOR_VOICE_STATS,
                                'YYYY-MM-DD',
                            ).toDate(),
                            maxSpan: 365,
                        }}
                        value={pageStatsFilters.period}
                        variant={'ghost'}
                    />
                </>
            ) : null,
        [
            isAnalyticsNewFilters,
            legacyStatsFilters.tags,
            pageStatsFilters.agents?.values,
            pageStatsFilters.integrations?.values,
            pageStatsFilters.period,
            phoneIntegrations,
        ],
    )

    const reportComponents = [
        {
            chart: VoiceOverviewChart.VoiceCallVolumeTotalCallCountTrendChart,
            size: 4,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricOutboundCallsCountTrend,
            size: 4,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricInboundCallsCountTrend,
            size: 4,
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
            chart: VoiceOverviewChart.VoiceCallCallerExperienceAverageWaitTimeChart,
            size: 6,
        },
        {
            chart: VoiceOverviewChart.VoiceCallCallCallerExperienceAverageTalkTime,
            size: 6,
        },
    ]

    return (
        <StatsPage
            title={VOICE_OVERVIEW_PAGE_TITLE}
            titleExtra={
                <>
                    {voiceFilters}
                    <VoiceOverviewDownloadDataButton />
                </>
            }
        >
            {isAnalyticsNewFilters && (
                <DashboardSection>
                    <DashboardGridCell size={12} className="pb-0">
                        <FiltersPanelWrapper
                            persistentFilters={
                                VoiceOverviewReportConfig.reportFilters
                                    .persistent
                            }
                            optionalFilters={
                                VoiceOverviewReportConfig.reportFilters.optional
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
            )}

            {shouldShowNewUnansweredStatuses ? (
                <DashboardSection>
                    {reportComponents.map((reportComponent) => (
                        <DashboardGridCell
                            size={reportComponent.size}
                            key={reportComponent.chart}
                        >
                            <CustomReportComponent
                                chart={reportComponent.chart}
                                config={VoiceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                    ))}
                </DashboardSection>
            ) : (
                <>
                    <DashboardSection title={CALLER_EXPERIENCE_METRICS_TITLE}>
                        <DashboardGridCell size={6}>
                            <CustomReportComponent
                                chart={
                                    VoiceOverviewChart.VoiceCallCallerExperienceAverageWaitTimeChart
                                }
                                config={VoiceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={6}>
                            <CustomReportComponent
                                chart={
                                    VoiceOverviewChart.VoiceCallCallCallerExperienceAverageTalkTime
                                }
                                config={VoiceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                    <DashboardSection title={CALL_VOLUME_METRICS_TITLE}>
                        <DashboardGridCell size={3}>
                            <CustomReportComponent
                                chart={
                                    VoiceOverviewChart.VoiceCallVolumeTotalCallCountTrendChart
                                }
                                config={VoiceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={3}>
                            <CustomReportComponent
                                chart={
                                    VoiceOverviewChart.VoiceCallVolumeMetricOutboundCallsCountTrend
                                }
                                config={VoiceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={3}>
                            <CustomReportComponent
                                chart={
                                    VoiceOverviewChart.VoiceCallVolumeMetricInboundCallsCountTrend
                                }
                                config={VoiceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={3}>
                            <CustomReportComponent
                                chart={
                                    VoiceOverviewChart.DEPRECATED_VoiceCallVolumeMetricMissedCallsCountTrendChart
                                }
                                config={VoiceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                </>
            )}
            <DashboardSection title={CALL_ACTIVITY_TITLE}>
                <DashboardGridCell>
                    <CustomReportComponent
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
