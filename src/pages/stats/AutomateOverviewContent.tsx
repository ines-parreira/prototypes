import classnames from 'classnames'
import React, {useMemo, useState} from 'react'
import moment from 'moment'
import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {AutomateOverviewFilters} from 'pages/stats/AutomateOverviewFilters'
import {ReportingGranularity} from 'models/reporting/types'
import {saveReport} from 'services/reporting/automateOverviewReportingService'

import {SegmentEvent, logEvent} from 'common/segment'

import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'

import {
    AutomatedInteractionsMetric,
    AutomationRateMetric,
    DecreaseInResolutionTimeMetric,
    AutomationDecreaseInFirstResponseTimeMetric,
    AutomationCostSavedMetric,
} from 'pages/automate/automate-metrics'

import {useGetCostPerAutomatedInteraction} from 'pages/automate/common/hooks/useGetCostPerAutomatedInteraction'
import {useGetCostPerBillableTicket} from 'pages/automate/common/hooks/useGetCostPerBillableTicket'
import {AGENT_COST_PER_TICKET} from 'pages/automate/automate-metrics/constants'

import useLocalStorage from 'hooks/useLocalStorage'
import {FeatureFlagKey} from 'config/featureFlags'
import {AUTOMATED_INTERACTION_TOOLTIP} from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'
import {AUTOMATION_RATE_TOOLTIP} from 'pages/automate/automate-metrics/AutomationRateMetric'
import {DownloadOverviewDataButton} from 'pages/stats/support-performance/components/DownloadOverviewDataButton'
import {
    AUTOMATE_STATS_MEASURE_LABEL_MAP,
    addZeroValueTimeSeriesForGreyArea,
    automatePercentLabel,
    calculateGreyArea,
    renderAutomateTooltipLabel,
    renderAutomateXTickLabel,
    sortByAutomateFeatureLabels,
} from 'hooks/reporting/automate/utils'
import {
    AutomateTimeseries,
    AutomateTrendMetrics,
    GreyArea,
} from 'hooks/reporting/automate/types'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {useTicketHandleTimeTrend} from 'hooks/reporting/metricTrends'
import {TimeSavedByAgentsMetric} from 'pages/automate/automate-metrics/TimeSavedByAgentsMetric'
import {
    SHORT_FORMAT,
    formatLabeledTimeSeriesData,
    formatTimeSeriesData,
} from 'pages/stats/common/utils'

import ChartCard from 'pages/stats/ChartCard'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'

import StatsPage from 'pages/stats/StatsPage'
import css from 'pages/stats/AutomateOverview.less'

import {
    AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL,
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
    PAGE_TITLE_AUTOMATE_PAYWALL,
} from 'pages/stats/self-service/constants'

import TipsToggle from 'pages/stats/TipsToggle'
import {AutomatedInteractionByFeatures} from 'pages/stats/types'

export const AAO_TIPS_VISIBILITY_KEY = 'gorgias-aao-stats-tips-visibility'

const BILLING_PIPE_LINE_DATE = 'June 20, 2023'

function getGreyAreaHint(showGreyArea: GreyArea | null) {
    return (
        showGreyArea && {
            titleExtra: (
                <div className={css.noDataHint}>
                    <i
                        className={classnames(
                            'material-icons-outlined',
                            css.crossLine
                        )}
                    >
                        {'texture'}
                    </i>
                    Data not yet available
                    <IconTooltip className={css.tooltip}>
                        Data is not yet available because interactions are
                        considered automated after 72 hours have passed without
                        a customer reply.
                    </IconTooltip>
                </div>
            ),
        }
    )
}

function useTimeSeriesFormattedData(
    timeseries: AutomateTimeseries,
    granularity: ReportingGranularity,
    showGreyArea: GreyArea | null
) {
    return useMemo(() => {
        const {
            automationRateTimeSeries,
            automatedInteractionByEventTypesTimeSeries,
            automatedInteractionTimeSeries,
        } = timeseries

        const automatedInteractionTimeSeriesData = formatTimeSeriesData(
            automatedInteractionTimeSeries,
            AUTOMATED_INTERACTIONS_LABEL,
            granularity
        )

        const automationRateTimeSeriesData = formatTimeSeriesData(
            automationRateTimeSeries,
            AUTOMATION_RATE_LABEL,
            granularity
        )
        const automatedInteractionByEventTypesTimeSeriesData =
            formatLabeledTimeSeriesData(
                automatedInteractionByEventTypesTimeSeries,
                automatedInteractionByEventTypesTimeSeries.map((item) =>
                    item[0].label
                        ? AUTOMATE_STATS_MEASURE_LABEL_MAP[
                              item[0].label as AutomatedInteractionByFeatures
                          ]
                        : 'Others'
                ),
                granularity
            ).sort(sortByAutomateFeatureLabels)

        return {
            automationRateTimeSeriesData: addZeroValueTimeSeriesForGreyArea(
                showGreyArea,
                automationRateTimeSeriesData
            ),
            automatedInteractionTimeSeriesData:
                addZeroValueTimeSeriesForGreyArea(
                    showGreyArea,
                    automatedInteractionTimeSeriesData
                ),
            automatedInteractionByEventTypesTimeSeriesData:
                addZeroValueTimeSeriesForGreyArea(
                    showGreyArea,
                    automatedInteractionByEventTypesTimeSeriesData
                ),
            exportableData: {
                automationRateTimeSeries,
                automatedInteractionTimeSeries,
                automatedInteractionByEventTypesTimeSeries,
            },
        }
    }, [granularity, showGreyArea, timeseries])
}

export default function AutomateOverviewContent({
    metrics,
    timeseries,
}: {
    metrics: Record<AutomateTrendMetrics, MetricTrend>
    timeseries: AutomateTimeseries
}) {
    const [noActivityAlert, setNoActivityAlert] = useState(true)
    const [hide72HourAlert, set72HoursAlert] = useState(false)
    const isTicketTimeToHandleEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.ObservabilityTicketTimeToHandle]

    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        AAO_TIPS_VISIBILITY_KEY,
        true
    )
    const {
        cleanStatsFilters: statsFilters,
        userTimezone,
        granularity,
    } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, period} = statsFilters
        return {
            channels,
            period,
        }
    }, [statsFilters])
    const ticketHandleTimeTrend = useTicketHandleTimeTrend(
        pageStatsFilters,
        userTimezone
    )
    const {
        automatedInteractionTrend,
        automationRateTrend,
        decreaseInFirstResponseTimeTrend,
        decreaseInResolutionTimeTrend,
    } = metrics
    const {isFetching: isTimeSeriesFetching} = timeseries
    const costPerAutomatedInteraction = useGetCostPerAutomatedInteraction()
    const costPerBillableTicket = useGetCostPerBillableTicket()

    const costSavedPerInteraction =
        costPerBillableTicket +
        AGENT_COST_PER_TICKET -
        costPerAutomatedInteraction

    const greyArea = useMemo(
        () =>
            calculateGreyArea(
                moment(statsFilters.period.start_datetime),
                moment(statsFilters.period.end_datetime)
            ),
        [statsFilters.period.end_datetime, statsFilters.period.start_datetime]
    )

    const greyAreaChartParam = useMemo(
        () =>
            greyArea
                ? {
                      start: greyArea.from.format(SHORT_FORMAT),
                      end: greyArea.to.format(SHORT_FORMAT),
                  }
                : undefined,
        [greyArea]
    )

    const isDurationLast3Days = useMemo(() => {
        const startDateTime = moment(statsFilters.period.start_datetime)
        const threeDaysAgo = moment().subtract(3, 'days')
        return startDateTime.isAfter(threeDaysAgo, 'date')
    }, [statsFilters.period.start_datetime])

    const {
        exportableData: timeseriesExportableData,
        automationRateTimeSeriesData,
        automatedInteractionTimeSeriesData,
        automatedInteractionByEventTypesTimeSeriesData,
    } = useTimeSeriesFormattedData(timeseries, granularity, greyArea)

    const hasActivity =
        !automatedInteractionTrend.isFetching &&
        automatedInteractionTrend.data?.value

    return (
        <div className="full-width">
            <StatsPage
                title={PAGE_TITLE_AUTOMATE_PAYWALL}
                titleExtra={
                    <>
                        <AutomateOverviewFilters />
                        <DownloadOverviewDataButton
                            onClick={async () => {
                                logEvent(SegmentEvent.StatDownloadClicked, {
                                    name: 'all-metrics',
                                })
                                await saveReport(
                                    {
                                        ...timeseriesExportableData,
                                        firstResponseTimeTrend:
                                            decreaseInFirstResponseTimeTrend,
                                        decreaseInResolutionTimeWithAutomationTrend:
                                            decreaseInResolutionTimeTrend,
                                        automationRateTrend,
                                        automatedInteractionTrend,
                                    },
                                    statsFilters.period
                                )
                            }}
                            disabled={false}
                        />
                    </>
                }
            >
                {!hide72HourAlert && (hasActivity || isDurationLast3Days) ? (
                    <div className={classnames(css.wrapper)}>
                        <Alert
                            type={AlertType.Info}
                            icon
                            onClose={() => set72HoursAlert(true)}
                        >
                            Data for the past 72 hours is not included on this
                            dashboard, as interactions are considered automated
                            after 72 hours have passed without a customer reply.
                        </Alert>
                    </div>
                ) : (
                    noActivityAlert &&
                    !automatedInteractionTrend.isFetching &&
                    !automatedInteractionTrend.data?.value && (
                        <div className={classnames(css.wrapper)}>
                            <Alert
                                type={AlertType.Error}
                                icon
                                onClose={() => setNoActivityAlert(false)}
                            >
                                {moment(BILLING_PIPE_LINE_DATE).isAfter(
                                    moment(statsFilters.period.end_datetime),
                                    'day'
                                ) ? (
                                    <span>
                                        There is no available data for this
                                        dashboard before{' '}
                                        <strong>
                                            {BILLING_PIPE_LINE_DATE}
                                        </strong>
                                    </span>
                                ) : (
                                    'There is no activity for these features. Your chat widget or Help Center may not be properly installed.'
                                )}
                            </Alert>
                        </div>
                    )
                )}

                <DashboardSection
                    title="Performance"
                    titleExtra={
                        <TipsToggle
                            isVisible={!!areTipsVisible}
                            onClick={() => setAreTipsVisible(!areTipsVisible)}
                        />
                    }
                >
                    <DashboardGridCell size={6}>
                        <AutomationRateMetric
                            trend={automationRateTrend}
                            showTips={areTipsVisible}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <AutomatedInteractionsMetric
                            trend={automatedInteractionTrend}
                            showTips={areTipsVisible}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Impact">
                    <DashboardGridCell size={6}>
                        <AutomationCostSavedMetric
                            trend={{
                                ...automatedInteractionTrend,
                                data: {
                                    value:
                                        (automatedInteractionTrend.data
                                            ?.value ?? 0) *
                                        costSavedPerInteraction,
                                    prevValue:
                                        (automatedInteractionTrend.data
                                            ?.prevValue ?? 0) *
                                        costSavedPerInteraction,
                                },
                            }}
                        />
                    </DashboardGridCell>
                    {isTicketTimeToHandleEnabled && (
                        <DashboardGridCell size={6}>
                            <TimeSavedByAgentsMetric
                                automatedInteractionTrend={
                                    automatedInteractionTrend
                                }
                                ticketHandleTimeTrend={ticketHandleTimeTrend}
                            />
                        </DashboardGridCell>
                    )}
                    <DashboardGridCell size={6}>
                        <DecreaseInResolutionTimeMetric
                            trend={decreaseInResolutionTimeTrend}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <AutomationDecreaseInFirstResponseTimeMetric
                            trend={decreaseInFirstResponseTimeTrend}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Performance over time">
                    <DashboardGridCell size={12}>
                        <ChartCard
                            {...getGreyAreaHint(greyArea)}
                            title={AUTOMATION_RATE_LABEL}
                            hint={{title: AUTOMATION_RATE_TOOLTIP}}
                        >
                            <LineChart
                                isCurvedLine={false}
                                isLoading={isTimeSeriesFetching}
                                data={automationRateTimeSeriesData}
                                greyArea={greyAreaChartParam}
                                hasBackground
                                _displayLegacyTooltip
                                yAxisBeginAtZero
                                renderXTickLabel={renderAutomateXTickLabel}
                                _renderLegacyTooltipLabel={renderAutomateTooltipLabel(
                                    true
                                )}
                                renderYTickLabel={automatePercentLabel}
                            />
                        </ChartCard>
                    </DashboardGridCell>

                    <DashboardGridCell size={12}>
                        <ChartCard
                            {...getGreyAreaHint(greyArea)}
                            title={AUTOMATED_INTERACTIONS_LABEL}
                            hint={{title: AUTOMATED_INTERACTION_TOOLTIP}}
                        >
                            <LineChart
                                isCurvedLine={false}
                                isLoading={isTimeSeriesFetching}
                                data={automatedInteractionTimeSeriesData}
                                greyArea={greyAreaChartParam}
                                hasBackground
                                _displayLegacyTooltip
                                _renderLegacyTooltipLabel={renderAutomateTooltipLabel()}
                                yAxisBeginAtZero
                                renderXTickLabel={renderAutomateXTickLabel}
                                yAxisScale={
                                    hasActivity ? {} : {min: 0, max: 5000}
                                }
                                renderYTickLabel={(val) => {
                                    return parseFloat(
                                        val.toString()
                                    ).toLocaleString()
                                }}
                            />
                        </ChartCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <ChartCard
                            {...getGreyAreaHint(greyArea)}
                            title={AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL}
                            hint={{title: AUTOMATED_INTERACTION_TOOLTIP}}
                        >
                            <LineChart
                                isCurvedLine={false}
                                yAxisBeginAtZero
                                isLoading={isTimeSeriesFetching}
                                data={
                                    automatedInteractionByEventTypesTimeSeriesData
                                }
                                greyArea={greyAreaChartParam}
                                _displayLegacyTooltip
                                displayLegend
                                toggleLegend
                                legendOnLeft
                                _renderLegacyTooltipLabel={renderAutomateTooltipLabel()}
                                customColors={[
                                    colors['📺 Classic'].Accessory.Navy_text
                                        .value,
                                    colors['📺 Classic'].Main.Variations
                                        .Primary_3.value,
                                    colors['📺 Classic'].Feedback.Variations
                                        .Warning_3.value,
                                    colors['📺 Classic'].Accessory.Purple_text
                                        .value,
                                    colors['📺 Classic'].Accessory.Green_text
                                        .value,
                                    colors['📺 Classic'].Feedback.Variations
                                        .Error_3.value,
                                    colors['📺 Classic'].Neutral.Grey_5.value,
                                    colors['📺 Classic'].Accessory.Yellow_text
                                        .value,
                                ]}
                                renderXTickLabel={renderAutomateXTickLabel}
                                yAxisScale={
                                    hasActivity ? {} : {min: 0, max: 750}
                                }
                                wrapperclassNames={css.chartWrapper}
                            />
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
                {userTimezone && (
                    <div
                        className={classnames(
                            css.pageFooter,
                            'caption-regular'
                        )}
                    >
                        Analytics are using {userTimezone} timezone
                    </div>
                )}
            </StatsPage>
        </div>
    )
}
