import {useFlags} from 'launchdarkly-react-client-sdk'
import moment from 'moment/moment'
import React, {useMemo, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilter} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilter'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {ProductType} from 'models/billing/types'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {FilterKey, FilterComponentKey} from 'models/stat/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import ChartCard from 'pages/stats/ChartCard'
import DEPRECATED_AgentsStatsFilter from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import DEPRECATED_PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import VoiceCallDirectionFilter from 'pages/stats/voice/components/VoiceCallDirectionFilter/VoiceCallDirectionFilter'
import VoiceCallCallerExperienceMetric from 'pages/stats/voice/components/VoiceCallerExperienceMetric/VoiceCallCallerExperienceMetric'
import {VoiceCallTable} from 'pages/stats/voice/components/VoiceCallTable/VoiceCallTable'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {VoiceOverviewDownloadDataButton} from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import {
    AVERAGE_TALK_TIME_METRIC_HINT,
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_HINT,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
    CALL_ACTIVITY_TITLE,
    CALL_LIST_TITLE,
    CALL_VOLUME_METRICS_TITLE,
    CALLER_EXPERIENCE_METRICS_TITLE,
    INBOUND_CALLS_METRIC_HINT,
    INBOUND_CALLS_METRIC_TITLE,
    MIN_DATE_FOR_VOICE_STATS,
    MISSED_CALLS_METRIC_HINT,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_HINT,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_HINT,
    TOTAL_CALLS_METRIC_TITLE,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import {
    VoiceCallAverageTimeMetric,
    VoiceCallFilterOptions,
} from 'pages/stats/voice/models/types'
import {saveReport} from 'services/reporting/voiceOverviewReportingService'
import {AccountFeature} from 'state/currentAccount/types'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'
import {VoiceMetric} from 'state/ui/stats/types'

export const VOICE_OVERVIEW_OPTIONAL_FILTERS: OptionalFilter[] = [
    FilterComponentKey.PhoneIntegrations,
    FilterKey.Tags,
    FilterKey.Agents,
]

function VoiceOverview() {
    const [tableFilterOption, setTableFilterOption] = useState(
        VoiceCallFilterOptions.All
    )
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersVoice]
    const voiceOverviewOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilter(
            VOICE_OVERVIEW_OPTIONAL_FILTERS
        )

    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {cleanStatsFilters: statsFiltersWithLogicalOperators, userTimezone} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const pageStatsFilters = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )
    useCleanStatsFiltersWithLogicalOperators(pageStatsFilters)

    const averageWaitTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.WaitTime,
        cleanStatsFilters,
        userTimezone
    )
    const averageTalkTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.TalkTime,
        cleanStatsFilters,
        userTimezone
    )
    const totalCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone
    )
    const outboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.outboundCalls
    )
    const inboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCalls
    )
    const missedCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.missedCalls
    )

    const exportableData = useMemo(() => {
        return {
            averageWaitTimeTrend,
            averageTalkTimeTrend,
            totalCallsCountTrend,
            outboundCallsCountTrend,
            inboundCallsCountTrend,
            missedCallsCountTrend,
        }
    }, [
        averageWaitTimeTrend,
        averageTalkTimeTrend,
        totalCallsCountTrend,
        outboundCallsCountTrend,
        inboundCallsCountTrend,
        missedCallsCountTrend,
    ])

    const loadingDownload = useMemo(() => {
        return Object.values(exportableData).some((metric) => metric.isFetching)
    }, [exportableData])

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
                                'YYYY-MM-DD'
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
        ]
    )

    return (
        <StatsPage
            title={VOICE_OVERVIEW_PAGE_TITLE}
            titleExtra={
                <>
                    {voiceFilters}
                    <VoiceOverviewDownloadDataButton
                        onClick={async () => {
                            logEvent(SegmentEvent.StatDownloadClicked, {
                                name: 'all-metrics',
                            })
                            await saveReport(
                                exportableData,
                                pageStatsFilters.period
                            )
                        }}
                        disabled={loadingDownload}
                    />
                </>
            }
        >
            {isAnalyticsNewFilters && (
                <DashboardSection>
                    <DashboardGridCell size={12} className="pb-0">
                        <FiltersPanelWrapper
                            persistentFilters={[FilterKey.Period]}
                            optionalFilters={voiceOverviewOptionalFilters}
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

            <DashboardSection title={CALLER_EXPERIENCE_METRICS_TITLE}>
                <DashboardGridCell size={6}>
                    <VoiceCallCallerExperienceMetric
                        isAnalyticsNewFilters={isAnalyticsNewFilters}
                        title={AVERAGE_WAIT_TIME_METRIC_TITLE}
                        hint={AVERAGE_WAIT_TIME_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={averageWaitTimeTrend}
                        metricData={{
                            metricName: VoiceMetric.AverageWaitTime,
                            title: AVERAGE_WAIT_TIME_METRIC_TITLE,
                        }}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={6}>
                    <VoiceCallCallerExperienceMetric
                        isAnalyticsNewFilters={isAnalyticsNewFilters}
                        title={AVERAGE_TALK_TIME_METRIC_TITLE}
                        hint={AVERAGE_TALK_TIME_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={averageTalkTimeTrend}
                        metricData={{
                            metricName: VoiceMetric.AverageTalkTime,
                            title: AVERAGE_TALK_TIME_METRIC_TITLE,
                        }}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title={CALL_VOLUME_METRICS_TITLE}>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={TOTAL_CALLS_METRIC_TITLE}
                        hint={TOTAL_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={totalCallsCountTrend}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={OUTBOUND_CALLS_METRIC_TITLE}
                        hint={OUTBOUND_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={outboundCallsCountTrend}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={INBOUND_CALLS_METRIC_TITLE}
                        hint={INBOUND_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={inboundCallsCountTrend}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={MISSED_CALLS_METRIC_TITLE}
                        hint={MISSED_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={missedCallsCountTrend}
                        moreIsBetter={false}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title={CALL_ACTIVITY_TITLE}>
                <DashboardGridCell>
                    <ChartCard
                        title={CALL_LIST_TITLE}
                        noPadding
                        titleExtra={
                            <VoiceCallDirectionFilter
                                onFilterSelect={(
                                    option: VoiceCallFilterOptions
                                ) => setTableFilterOption(option)}
                            />
                        }
                    >
                        <VoiceCallTable
                            statsFilters={cleanStatsFilters}
                            userTimezone={userTimezone}
                            filterOption={tableFilterOption}
                        />
                    </ChartCard>
                </DashboardGridCell>
            </DashboardSection>
            <AnalyticsFooter />
        </StatsPage>
    )
}

export default withProductEnabledPaywall(
    ProductType.Voice,
    AccountFeature.PhoneNumber
)(VoiceOverview)
