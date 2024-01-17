import classnames from 'classnames'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import moment, {Moment} from 'moment'
import {Scale, TooltipItem} from 'chart.js'
import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {saveReport} from 'services/reporting/automateOverviewReportingService'

import {SegmentEvent, logEvent} from 'common/segment'

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
import {TicketChannel} from 'business/types/ticket'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'

import withStoreIntegration from 'pages/automate/common/utils/withStoreIntegrations'

import {
    AutomatedInteractionsMetric,
    AutomationRateMetric,
    AutomationTimeSavedMetric,
    AutomationDecreaseInFirstResponseTimeMetric,
    AutomationCostSavedMetric,
} from 'pages/automate/automate-metrics'

import {useGetCostPerAutomatedInteraction} from 'pages/automate/common/hooks/useGetCostPerAutomatedInteraction'
import {useGetCostPerBillableTicket} from 'pages/automate/common/hooks/useGetCostPerBillableTicket'
import {AGENT_COST_PER_TICKET} from 'pages/automate/automate-metrics/constants'
import useAppDispatch from 'hooks/useAppDispatch'
import useSearch from 'hooks/useSearch'
import useLocalStorage from 'hooks/useLocalStorage'
import {mergeStatsFilters} from 'state/stats/actions'
import {FeatureFlagKey} from 'config/featureFlags'
import {AUTOMATED_INTERACTION_TOOLTIP} from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'
import {AUTOMATION_RATE_TOOLTIP} from 'pages/automate/automate-metrics/AutomationRateMetric'
import {
    SHORT_FORMAT,
    formatLabeledTimeSeriesData,
    formatTimeSeriesData,
} from './common/utils'

import ChannelsStatsFilter from './ChannelsStatsFilter'
import ChartCard from './ChartCard'
import DashboardGridCell from './DashboardGridCell'
import DashboardSection from './DashboardSection'
import {DownloadOverviewDataButton} from './DownloadOverviewDataButton'
import LineChart from './LineChart'

import PeriodStatsFilter from './PeriodStatsFilter'
import StatsPage from './StatsPage'
import css from './AutomateOverview.less'

import {DEFAULT_TIMEZONE} from './revenue/constants/components'
import {
    AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL,
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
    PAGE_TITLE_AUTOMATE_PAYWALL,
    PAGE_TITLE_OVERVIEW,
} from './self-service/constants'
import {GreyArea} from './ChartPluginGreyArea'
import SelfServiceStatsPagePaywallCustomCta from './self-service/SelfServiceStatsPagePaywallCustomCta'

import TipsToggle from './TipsToggle'

import {FEATURE_LABELS} from './constants'
import {AutomatedInteractionByFeatures} from './types'

export const AAO_TIPS_VISIBILITY_KEY = 'gorgias-aao-stats-tips-visibility'

const BILLING_PIPE_LINE_DATE = 'June 20, 2023'

export function AutomateOverview() {
    const [noActivityAlert, setNoActivityAlert] = useState(true)
    const [hide72HourAlert, set72HoursAlert] = useState(false)
    const isAutomateOverviewChannelsFilter: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateOverviewChannelsFilter]
    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        AAO_TIPS_VISIBILITY_KEY,
        true
    )
    const dispatch = useAppDispatch()
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const statsFilters = useAppSelector(getStatsFilters)
    const params = useSearch() as {
        source?: 'automate'
    }

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, period} = statsFilters
        return {
            channels,
            period: {
                start_datetime: period.start_datetime,
                end_datetime: period.end_datetime,
            },
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
    const automatedInteractionTrend = useAutomatedInteractionsTrend(
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

    const costPerAutomatedInteraction = useGetCostPerAutomatedInteraction()
    const costPerBillableTicket = useGetCostPerBillableTicket()

    const costSavedPerInteraction =
        costPerBillableTicket +
        AGENT_COST_PER_TICKET -
        costPerAutomatedInteraction

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

    useEffect(() => {
        if (params.source === 'automate') {
            const newValues = {
                startDatetime: moment().subtract(28, 'days').format(),
                endDatetime: moment().endOf('day').format(),
            }

            dispatch(
                mergeStatsFilters({
                    period: {
                        start_datetime: newValues.startDatetime,
                        end_datetime: newValues.endDatetime,
                    },
                })
            )
        }
    }, [params.source, dispatch])

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
            automatedInteractionTrend,
        }
    }, [
        automationRateTimeSeries,
        automatedInteractionTimeSeries,
        automatedInteractionByEventTypesTimeSeries,
        firstResponseTimeTrend,
        resolutionTimeTrend,
        automationRateTrend,
        automatedInteractionTrend,
    ])

    const hasActivity =
        !automatedInteractionTrend.isFetching &&
        automatedInteractionTrend.data?.value

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

    return (
        <div className="full-width">
            <StatsPage
                title={PAGE_TITLE_AUTOMATE_PAYWALL}
                filters={
                    <>
                        {isAutomateOverviewChannelsFilter && (
                            <ChannelsStatsFilter
                                value={pageStatsFilters.channels}
                                channelsFilter={[
                                    TicketChannel.Chat,
                                    TicketChannel.HelpCenter,
                                    TicketChannel.ContactForm,
                                    TicketChannel.Email,
                                ]}
                                variant="ghost"
                            />
                        )}
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
                    title="Impact"
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

                    <DashboardGridCell size={4}>
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

                    <DashboardGridCell size={4}>
                        <AutomationTimeSavedMetric
                            trend={resolutionTimeTrend}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <AutomationDecreaseInFirstResponseTimeMetric
                            trend={firstResponseTimeTrend}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Performance">
                    <DashboardGridCell size={12}>
                        <ChartCard
                            {...getGreyAreaHint()}
                            title={AUTOMATION_RATE_LABEL}
                            hint={AUTOMATION_RATE_TOOLTIP}
                            tooltipProps={{autohide: false}}
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
                            hint={AUTOMATED_INTERACTION_TOOLTIP}
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
                            hint={AUTOMATED_INTERACTION_TOOLTIP}
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

export default withFeaturePaywall(
    AccountFeature.AutomationSelfServiceStatistics,
    undefined,
    {
        [AccountFeature.AutomationSelfServiceStatistics]: {
            ...defaultPaywallConfigs[AccountFeature.AutomationAddonOverview],
            pageHeader: (
                <PageHeader
                    title={<HeaderTitle title={PAGE_TITLE_AUTOMATE_PAYWALL} />}
                />
            ),
            customCta: <SelfServiceStatsPagePaywallCustomCta />,
        } as PaywallConfig,
    }
)(withStoreIntegration(PAGE_TITLE_OVERVIEW, AutomateOverview))
