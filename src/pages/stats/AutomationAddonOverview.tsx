import classnames from 'classnames'
import React, {useCallback, useMemo, useState} from 'react'
import moment, {Moment} from 'moment'
import {useLocalStorage} from 'react-use'
import {Scale, TooltipItem} from 'chart.js'

import {SegmentEvent, logEvent} from 'common/segment'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {saveReport} from 'services/reporting/automationAddOnReportingService'
import {
    useAutomatedInteractionByEventTypesTimeSeries,
    useAutomatedInteractionTimeSeries,
    useAutomationRateTimeSeries,
} from 'hooks/reporting/timeSeries'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import {getTimezone} from 'state/currentUser/selectors'
import {getStatsFilters} from 'state/stats/selectors'
import {periodToReportingGranularity} from 'utils/reporting'
import colors from 'assets/tokens/colors.json'
import {
    useAutomatedInteractionsTrend,
    useAutomationRateTrend,
    useFirstResponseTimeWithAutomationTrend,
    useResolutionTimeWithAutomationTrend,
} from 'hooks/reporting/metricTrends'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {AccountFeature} from 'state/currentAccount/types'
import PageHeader from 'pages/common/components/PageHeader'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from 'config/paywalls'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TicketChannel} from 'business/types/ticket'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import {
    MetricTrendFormat,
    SHORT_FORMAT,
    formatLabeledTimeSeriesData,
    formatMetricValue,
    formatTimeSeriesData,
} from './common/utils'
import BigNumberMetric from './BigNumberMetric'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import ChartCard from './ChartCard'
import DashboardGridCell from './DashboardGridCell'
import DashboardSection from './DashboardSection'
import {DownloadOverviewDataButton} from './DownloadOverviewDataButton'
import LineChart from './LineChart'
import MetricCard from './MetricCard'
import PeriodStatsFilter from './PeriodStatsFilter'
import StatsPage from './StatsPage'
import css from './AutomationAddonOverview.less'
import TrendBadge from './TrendBadge'
import {DEFAULT_TIMEZONE} from './revenue/constants/components'
import {
    AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL,
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
    OVERALL_TIME_SAVED_BY_YOUR_TEAM,
    PAGE_TITLE_AAO,
    TIME_SAVED_ON_FIRST_RESPONSE,
} from './self-service/constants'
import {GreyArea} from './ChartPluginGreyArea'
import SelfServiceStatsPagePaywallCustomCta from './self-service/SelfServiceStatsPagePaywallCustomCta'
import PerformanceTip from './PerformanceTip'
import TipsToggle from './TipsToggle'
import withEcommerceIntegration from './withEcommerceIntegrations'
import {FEATURE_LABELS} from './constants'
import {AutomatedInteractionByFeatures} from './types'

export const AAO_TIPS_VISIBILITY_KEY = 'gorgias-aao-stats-tips-visibility'

// Below values are from https://app.periscopedata.com/app/gorgias/1123203/[Cross]-Automation-Add-on-Performance?widget=17138886&udv=0
export const automationRate = {
    top10P: 0.31,
    avg: 0.12,
}
// Value to percentile
const brackets: {value: number; result: string}[] = [
    {value: automationRate.top10P, result: 'top 10%'}, // 90th Percentile
    {value: 0.2165, result: 'top 20%'}, // 80th Percentile and so on..
    {value: 0.1562, result: 'top 30%'},
    {value: 0.1081, result: 'top 40%'},
    {value: 0.0674, result: 'top 50%'},
    {value: 0.0292, result: 'bottom 40%'},
    {value: 0.0054, result: 'bottom 30%'},
]
const BILLING_PIPE_LINE_DATE = 'June 20, 2023'

export function AutomationAddOnOverview() {
    const [showNoActivityAlert, setShowActivityAlert] = useState(true)

    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        AAO_TIPS_VISIBILITY_KEY,
        true
    )
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const statsFilters = useAppSelector(getStatsFilters)
    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, period} = statsFilters
        return {
            channels,
            period,
        }
    }, [statsFilters])
    const requestStatsFilters = useCleanStatsFilters(pageStatsFilters)
    const granularity = periodToReportingGranularity(requestStatsFilters.period)

    // Metrics
    const firstResponseTimeTrend = useFirstResponseTimeWithAutomationTrend(
        pageStatsFilters,
        userTimezone
    )
    const resolutionTimeTrend = useResolutionTimeWithAutomationTrend(
        pageStatsFilters,
        userTimezone
    )

    const automationRateTrend = useAutomationRateTrend(
        pageStatsFilters,
        userTimezone
    )
    const automatedInterationTrend = useAutomatedInteractionsTrend(
        pageStatsFilters,
        userTimezone
    )

    // Timeseries
    const automationRateTimeSeries = useAutomationRateTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )
    const automatedInteractionTimeSeries = useAutomatedInteractionTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )
    const automatedInteractionByEventTypesTimeSeries =
        useAutomatedInteractionByEventTypesTimeSeries(
            requestStatsFilters,
            userTimezone,
            granularity
        )
    const automatedInteractionTimeSeriesData = formatTimeSeriesData(
        automatedInteractionTimeSeries.data,
        AUTOMATED_INTERACTIONS_LABEL,
        granularity
    )

    const automationRateTimeSeriesData = formatTimeSeriesData(
        automationRateTimeSeries.data,
        AUTOMATION_RATE_LABEL,
        granularity
    )

    const automatedInteractionByEventTypesTimeSeriesData =
        formatLabeledTimeSeriesData(
            automatedInteractionByEventTypesTimeSeries.data,
            automatedInteractionByEventTypesTimeSeries.data
                ? automatedInteractionByEventTypesTimeSeries.data.map((item) =>
                      item[0].label
                          ? FEATURE_LABELS[
                                item[0].label as AutomatedInteractionByFeatures
                            ]
                          : 'Others'
                  )
                : [AUTOMATED_INTERACTIONS_LABEL],
            granularity
        ).sort(
            (a, b) =>
                Object.values(FEATURE_LABELS).indexOf(a.label) -
                Object.values(FEATURE_LABELS).indexOf(b.label)
        )

    const showGreyArea = useMemo((): Moment[] => {
        const endDateTime = moment(statsFilters.period.end_datetime)
        const startdDateTime = moment(statsFilters.period.start_datetime)
        const threeDaysAgo = moment().subtract(2, 'days')
        if (endDateTime.isAfter(threeDaysAgo, 'date')) {
            if (startdDateTime.isAfter(threeDaysAgo)) {
                return [startdDateTime, endDateTime]
            }
            return [threeDaysAgo, endDateTime]
        }

        return []
    }, [statsFilters.period.end_datetime, statsFilters.period.start_datetime])

    const isDurationLast3Days = useMemo(() => {
        const startdDateTime = moment(statsFilters.period.start_datetime)
        const threeDaysAgo = moment().subtract(3, 'days')
        return startdDateTime.isAfter(threeDaysAgo, 'date')
    }, [statsFilters.period.start_datetime])

    const plotIfGrayArea = useCallback(
        (
            timeSeries: {values: {x: string; y: number}[]}[]
        ): GreyArea | undefined => {
            if (showGreyArea.length) {
                for (const dateTime of showGreyArea) {
                    const timeSeriesData = {
                        x: dateTime.format(SHORT_FORMAT),
                        y: 0,
                    }
                    for (const serie of timeSeries) {
                        let i = serie.values.length
                        while (i > 0) {
                            i--
                            const v = serie.values[i]
                            if (
                                moment(v.x, SHORT_FORMAT).isBefore(
                                    moment(timeSeriesData.x, SHORT_FORMAT)
                                )
                            ) {
                                serie.values.splice(i + 1, 0, timeSeriesData)
                                break
                            } else if (v.x === timeSeriesData.x) {
                                break
                            }
                        }
                    }
                }
                return {
                    start: showGreyArea[0].format(SHORT_FORMAT),
                    end: showGreyArea[1].format(SHORT_FORMAT),
                }
            }
        },
        [showGreyArea]
    )

    const plotIfGrayAreaForAutomationRate = useMemo(() => {
        return (
            automationRateTimeSeriesData &&
            plotIfGrayArea(automationRateTimeSeriesData)
        )
    }, [automationRateTimeSeriesData, plotIfGrayArea])

    const plotIfGrayAreaForAutomatedInteraction = useMemo(() => {
        return (
            automatedInteractionTimeSeriesData &&
            plotIfGrayArea(automatedInteractionTimeSeriesData)
        )
    }, [automatedInteractionTimeSeriesData, plotIfGrayArea])

    const plotIfGrayAreaForAutomatedInteractionByFeatures = useMemo(() => {
        return (
            automatedInteractionByEventTypesTimeSeriesData &&
            plotIfGrayArea(automatedInteractionByEventTypesTimeSeriesData)
        )
    }, [automatedInteractionByEventTypesTimeSeriesData, plotIfGrayArea])

    const getGreyAreaHint = () => {
        return (
            showGreyArea.length && {
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
                            considered automated after 72 hours have passed
                            without a customer reply.
                        </IconTooltip>
                    </div>
                ),
            }
        )
    }
    const exportableData = useMemo(() => {
        return {
            automationRateTimeSeries,
            automatedInteractionTimeSeries,
            automatedInteractionByEventTypesTimeSeries,
            firstResponseTimeTrend,
            resolutionTimeTrend,
            automationRateTrend,
            automatedInterationTrend,
        }
    }, [
        automationRateTimeSeries,
        automatedInteractionTimeSeries,
        automatedInteractionByEventTypesTimeSeries,
        firstResponseTimeTrend,
        resolutionTimeTrend,
        automationRateTrend,
        automatedInterationTrend,
    ])

    const hasActivity =
        !automatedInterationTrend.isFetching &&
        automatedInterationTrend.data?.value

    const getTrendProps = (metricTrend: MetricTrend) => ({
        value: metricTrend.data?.value || 0,
        prevValue: metricTrend.data?.prevValue || 0,
        format: 'percent' as MetricTrendFormat,
        interpretAs: 'more-is-better' as const,
    })

    const automationRateValue = automationRateTrend.data?.value || 0

    const automationRateSentiment = useMemo(() => {
        if (automationRateValue > automationRate.top10P) return 'success'
        else if (automationRateValue > automationRate.avg)
            return 'light-success'
        else if (automationRateValue > 0) return 'light-error'
        return 'neutral'
    }, [automationRateValue])

    const percentLabel = (value: number) =>
        `${parseFloat((value * 100).toFixed(2))}%`

    const renderTooltipLabel =
        (isPercentage = false) =>
        ({raw, dataset}: TooltipItem<'line'>) => {
            return `${dataset?.label || ''}:  ${
                isPercentage ? percentLabel(raw as number) : (raw as number)
            }`
        }

    const propsForPercentValues = {
        _renderLegacyTooltipLabel: renderTooltipLabel(true),
        renderYTickLabel: (value: string | number) =>
            percentLabel(value as number),
    }

    const topOrBottomPercent = useMemo(() => {
        return (
            brackets.find((bracket) => automationRateValue > bracket.value)
                ?.result || 'bottom 20%'
        )
    }, [automationRateValue])

    const renderXTickLabel = function (
        this: Scale,
        value: string | number,
        index: number
    ) {
        const labelDate = moment(this.getLabelForValue(index), SHORT_FORMAT)
        if (labelDate.isValid())
            return moment(this.getLabelForValue(index), SHORT_FORMAT).format(
                'MMM D'
            )
        return this.getLabelForValue(index)
    }

    const getDurationLable = (trend: MetricTrend) => {
        return trend.data?.value
            ? formatMetricValue(trend.data?.value, 'duration')
            : '0h 0m'
    }

    return (
        <div className="full-width">
            <StatsPage
                title={PAGE_TITLE_AAO}
                filters={
                    <>
                        <ChannelsStatsFilter
                            value={pageStatsFilters.channels}
                            channels={[
                                TicketChannel.Chat,
                                TicketChannel.HelpCenter,
                                TicketChannel.ContactForm,
                                TicketChannel.Email,
                            ]}
                            variant="ghost"
                        />

                        <PeriodStatsFilter
                            initialSettings={{
                                maxSpan: 365,
                            }}
                            value={pageStatsFilters.period}
                            variant="ghost"
                        />
                        <DownloadOverviewDataButton
                            onClick={async () => {
                                logEvent(SegmentEvent.StatDownloadClicked, {
                                    name: 'all-metrics',
                                })
                                await saveReport(
                                    exportableData,
                                    statsFilters.period
                                )
                            }}
                            disabled={false}
                        />
                    </>
                }
            >
                <div className={classnames(css.wrapper)}>
                    {hasActivity || isDurationLast3Days ? (
                        <Alert type={AlertType.Info} icon>
                            Data for the past 72 hours is not included on this
                            dashboard, as interactions are considered automated
                            after 72 hours have passed without a customer reply.
                        </Alert>
                    ) : (
                        showNoActivityAlert && (
                            <Alert
                                type={AlertType.Error}
                                icon
                                onClose={() => setShowActivityAlert(false)}
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
                        )
                    )}
                </div>
                <DashboardSection
                    title="Impact"
                    titleExtra={
                        <TipsToggle
                            isVisible={!!areTipsVisible}
                            onClick={() => setAreTipsVisible(!areTipsVisible)}
                        />
                    }
                >
                    <DashboardGridCell size={6}>
                        <MetricCard
                            title={AUTOMATION_RATE_LABEL}
                            hint={{
                                title: 'Automated interactions as a percent of all customer interactions handled without any agent intervention using Automation Add-on features.',
                            }}
                            isLoading={automationRateTrend.isFetching}
                            trendBadge={
                                <TrendBadge
                                    {...getTrendProps(automationRateTrend)}
                                />
                            }
                            tip={
                                areTipsVisible && (
                                    <PerformanceTip
                                        topTen={percentLabel(
                                            automationRate.top10P
                                        )}
                                        avgMerchant={percentLabel(
                                            automationRate.avg
                                        )}
                                        type={automationRateSentiment}
                                    >
                                        You’re in the {topOrBottomPercent} of
                                        merchants. Set up all{' '}
                                        <a
                                            target="blank"
                                            href="https://docs.gorgias.com/en-US/automation-add-on-101-81855"
                                        >
                                            Automation Add-on features
                                        </a>{' '}
                                        to capture more traffic and increase
                                        your automation rate.
                                    </PerformanceTip>
                                )
                            }
                        >
                            <BigNumberMetric
                                isLoading={automationRateTrend.isFetching}
                            >
                                {automationRateValue
                                    ? formatMetricValue(
                                          automationRateValue * 100,
                                          'percent'
                                      )
                                    : '-'}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <MetricCard
                            isLoading={automatedInterationTrend.isFetching}
                            title={AUTOMATED_INTERACTIONS_LABEL}
                            hint={{
                                title: 'Fully automated interactions solved without any agent intervention using Automation Add-on features.',
                            }}
                            trendBadge={
                                <TrendBadge
                                    {...getTrendProps(automatedInterationTrend)}
                                />
                            }
                            tip={
                                areTipsVisible && (
                                    <PerformanceTip showBenchmark={false}>
                                        Check out our{' '}
                                        <a
                                            target="blank"
                                            href="https://link.gorgias.com/aut-playbook"
                                        >
                                            {' '}
                                            Automation Playbook
                                        </a>{' '}
                                        for tactical tips on how to use
                                        Automation Add-on features to their full
                                        potential. Visit
                                        <a
                                            target="blank"
                                            href="/app/settings/billing"
                                        >
                                            {' '}
                                            billing
                                        </a>{' '}
                                        to make sure your automation plan is the
                                        right size for you.
                                    </PerformanceTip>
                                )
                            }
                        >
                            <BigNumberMetric
                                isLoading={automatedInterationTrend.isFetching}
                            >
                                {formatMetricValue(
                                    automatedInterationTrend.data?.value
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <MetricCard
                            title={TIME_SAVED_ON_FIRST_RESPONSE}
                            hint={{
                                title: 'How much longer customers would have had to wait for a first response if you were not using Automation Add-on features, based on your average first response time.',
                            }}
                            isLoading={firstResponseTimeTrend.isFetching}
                            trendBadge={
                                <TrendBadge
                                    {...getTrendProps(firstResponseTimeTrend)}
                                />
                            }
                        >
                            <BigNumberMetric
                                isLoading={firstResponseTimeTrend.isFetching}
                            >
                                {getDurationLable(firstResponseTimeTrend)}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <MetricCard
                            title={OVERALL_TIME_SAVED_BY_YOUR_TEAM}
                            hint={{
                                title: 'How much time agents would have spent resolving your automated interactions, based on your average resolution time.',
                            }}
                            isLoading={resolutionTimeTrend.isFetching}
                            trendBadge={
                                <TrendBadge
                                    {...getTrendProps(resolutionTimeTrend)}
                                />
                            }
                        >
                            <BigNumberMetric
                                isLoading={resolutionTimeTrend.isFetching}
                            >
                                {getDurationLable(resolutionTimeTrend)}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Performance">
                    <DashboardGridCell size={12}>
                        <ChartCard
                            {...getGreyAreaHint()}
                            title={AUTOMATION_RATE_LABEL}
                            hint="Automated interactions as a percent of all customer interactions handled without any agent intervention using Automation Add-on features."
                        >
                            <LineChart
                                isCurvedLine={false}
                                isLoading={!automationRateTimeSeries.data}
                                data={automationRateTimeSeriesData}
                                greyArea={plotIfGrayAreaForAutomationRate}
                                hasBackground
                                _displayLegacyTooltip
                                yAxisBeginAtZero
                                renderXTickLabel={renderXTickLabel}
                                {...propsForPercentValues}
                            />
                        </ChartCard>
                    </DashboardGridCell>

                    <DashboardGridCell size={12}>
                        <ChartCard
                            {...getGreyAreaHint()}
                            title={AUTOMATED_INTERACTIONS_LABEL}
                            hint="Fully automated interactions that are solved without human intervention using Automation Add-on features."
                        >
                            <LineChart
                                isCurvedLine={false}
                                isLoading={!automatedInteractionTimeSeries.data}
                                data={automatedInteractionTimeSeriesData}
                                greyArea={plotIfGrayAreaForAutomatedInteraction}
                                hasBackground
                                _displayLegacyTooltip
                                _renderLegacyTooltipLabel={renderTooltipLabel()}
                                yAxisBeginAtZero
                                renderXTickLabel={renderXTickLabel}
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
                            {...getGreyAreaHint()}
                            title={AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL}
                            hint="Fully automated interactions solved without any agent intervention using Automation Add-on features."
                        >
                            <LineChart
                                isCurvedLine={false}
                                yAxisBeginAtZero
                                isLoading={
                                    !automatedInteractionByEventTypesTimeSeries.data
                                }
                                data={
                                    automatedInteractionByEventTypesTimeSeriesData
                                }
                                greyArea={
                                    plotIfGrayAreaForAutomatedInteractionByFeatures
                                }
                                _displayLegacyTooltip
                                displayLegend
                                toggleLegend
                                legendOnLeft
                                _renderLegacyTooltipLabel={renderTooltipLabel()}
                                customColors={[
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
                                renderXTickLabel={renderXTickLabel}
                                yAxisScale={
                                    hasActivity ? {} : {min: 0, max: 750}
                                }
                                wrapperclassNames={css.chartWrapper}
                            />
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
export default withFeaturePaywall(
    AccountFeature.AutomationSelfServiceStatistics,
    undefined,
    {
        [AccountFeature.AutomationSelfServiceStatistics]: {
            ...defaultPaywallConfigs[AccountFeature.AutomationAddonOverview],
            pageHeader: (
                <PageHeader title={<HeaderTitle title={PAGE_TITLE_AAO} />} />
            ),
            customCta: <SelfServiceStatsPagePaywallCustomCta />,
        } as PaywallConfig,
    }
)(withEcommerceIntegration(PAGE_TITLE_AAO, AutomationAddOnOverview))
