import moment from 'moment/moment'
import {useMemo} from 'react'

import {AutomateStatsMeasureLabelMap} from 'hooks/reporting/automate/automateStatsMeasureLabelMap'
import {
    fetchAutomateMetricsTimeSeries,
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'hooks/reporting/automate/useAutomationDataset'
import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import {calculateGreyArea} from 'hooks/reporting/automate/utils'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'

import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

import {
    DECREASE_IN_FIRST_RESPONSE,
    DECREASE_IN_RESOLUTION_TIME,
} from 'pages/automate/automate-metrics/constants'
import {getTimeSeriesFormattedData} from 'pages/stats/automate/overview/utils'
import {
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
} from 'pages/stats/self-service/constants'
import {AutomatedInteractionByFeatures} from 'pages/stats/types'

import {
    CURRENT_PERIOD_LABEL,
    EMPTY_LABEL,
    PREVIOUS_PERIOD_LABEL,
} from 'services/reporting/constants'
import {createCsv} from 'utils/file'

export const AUTOMATE_IMPACT_FILENAME = 'automate-impact'
export const AUTOMATE_PERFORMANCE_FILENAME = 'automate-performance'
export const AUTOMATE_PERFORMANCE_FEATURE_FILENAME =
    'automate-performance-feature'
export const OVERVIEW_METRICS_FILENAME = 'overview-metrics'

export interface AutomatePerformanceReportData {
    automationRateTimeSeries: TimeSeriesDataItem[][]
    automatedInteractionTimeSeries: TimeSeriesDataItem[][]
}

export interface AutomateImpactReportData {
    firstResponseTimeTrend: MetricTrend
    decreaseInResolutionTimeWithAutomationTrend: MetricTrend
    automationRateTrend: MetricTrend
    automatedInteractionTrend: MetricTrend
}

const round = (value?: number | null) => (value ? Math.round(value) : 0)
const valueOrZero = (value?: number | null) => value || 0

export const formatPerformanceFeatureData = (
    automateStatsMeasureLabelMap: Record<
        AutomatedInteractionByFeatures,
        string
    >,
    automatedInteractionByEventTypesTimeSeries: TimeSeriesDataItem[][]
) => {
    const labels =
        automatedInteractionByEventTypesTimeSeries?.map(
            (item) =>
                automateStatsMeasureLabelMap[
                    item[0].label as AutomatedInteractionByFeatures
                ]
        ) || []

    return [
        [EMPTY_LABEL, ...labels],
        ...(automatedInteractionByEventTypesTimeSeries?.[0]?.map((date) => [
            date.dateTime,
            ...(automatedInteractionByEventTypesTimeSeries?.map((timeseries) =>
                valueOrZero(
                    timeseries.find(({dateTime}) => date.dateTime === dateTime)
                        ?.value
                )
            ) || []),
        ]) || []),
    ]
}
export const formatImpactReport = (data: AutomateImpactReportData) => {
    const {
        firstResponseTimeTrend,
        decreaseInResolutionTimeWithAutomationTrend,
        automationRateTrend,
        automatedInteractionTrend,
    } = data

    return [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            AUTOMATION_RATE_LABEL,
            valueOrZero(automationRateTrend.data?.value),
            valueOrZero(automationRateTrend.data?.prevValue),
        ],
        [
            AUTOMATED_INTERACTIONS_LABEL,
            valueOrZero(automatedInteractionTrend.data?.value),
            valueOrZero(automatedInteractionTrend.data?.prevValue),
        ],
        [
            DECREASE_IN_FIRST_RESPONSE,
            round(firstResponseTimeTrend.data?.value),
            round(firstResponseTimeTrend.data?.prevValue),
        ],
        [
            DECREASE_IN_RESOLUTION_TIME,
            round(decreaseInResolutionTimeWithAutomationTrend.data?.value),
            round(decreaseInResolutionTimeWithAutomationTrend.data?.prevValue),
        ],
    ]
}

export const formatPerformanceReportData = (
    data: AutomatePerformanceReportData
) => {
    const {automationRateTimeSeries, automatedInteractionTimeSeries} = data

    return [
        [EMPTY_LABEL, AUTOMATED_INTERACTIONS_LABEL, AUTOMATION_RATE_LABEL],
        ...(automatedInteractionTimeSeries?.[0]?.map((date) => [
            date.dateTime,
            valueOrZero(
                automatedInteractionTimeSeries?.[0]?.find(
                    ({dateTime}) => date.dateTime === dateTime
                )?.value
            ),
            valueOrZero(
                automationRateTimeSeries?.[0]?.find(
                    ({dateTime}) => date.dateTime === dateTime
                )?.value
            ),
        ]) || []),
    ]
}

const useAutomatePerformanceReport = (
    statsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity
) => {
    const timeSeries = useAutomateMetricsTimeSeries(
        statsFilters,
        userTimezone,
        granularity
    )
    const greyArea = useMemo(
        () =>
            calculateGreyArea(
                moment(statsFilters.period.start_datetime),
                moment(statsFilters.period.end_datetime)
            ),
        [statsFilters.period.end_datetime, statsFilters.period.start_datetime]
    )
    const {exportableData: timeSeriesExportableData} = useMemo(
        () => getTimeSeriesFormattedData(timeSeries, granularity, greyArea),
        [granularity, greyArea, timeSeries]
    )

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        AUTOMATE_PERFORMANCE_FILENAME
    )

    return {
        files: {
            [fileName]: createCsv(
                formatPerformanceReportData({...timeSeriesExportableData})
            ),
        },
        fileName,
        isFetching: timeSeries.isFetching,
    }
}

export const fetchAutomatePerformanceReport = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
    context: {
        isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined
        aiAgentUserId: string | undefined
    }
) => {
    return fetchAutomateMetricsTimeSeries(
        statsFilters,
        userTimezone,
        granularity,
        context.isAutomateNonFilteredDenominatorInAutomationRate,
        context.aiAgentUserId
    ).then((result) => {
        const greyArea = calculateGreyArea(
            moment(statsFilters.period.start_datetime),
            moment(statsFilters.period.end_datetime)
        )

        const {exportableData: timeSeriesExportableData} =
            getTimeSeriesFormattedData(result, granularity, greyArea)

        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            AUTOMATE_PERFORMANCE_FILENAME
        )

        return {
            files: {
                [fileName]: createCsv(
                    formatPerformanceReportData(timeSeriesExportableData)
                ),
            },
            fileName,
            isLoading: false,
        }
    })
}

const usePerformanceByFeatureReport = (
    statsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity
) => {
    const timeSeries = useAutomateMetricsTimeSeries(
        statsFilters,
        userTimezone,
        granularity
    )
    const greyArea = useMemo(
        () =>
            calculateGreyArea(
                moment(statsFilters.period.start_datetime),
                moment(statsFilters.period.end_datetime)
            ),
        [statsFilters.period.end_datetime, statsFilters.period.start_datetime]
    )
    const {exportableData: timeSeriesExportableData} = useMemo(
        () => getTimeSeriesFormattedData(timeSeries, granularity, greyArea),
        [granularity, greyArea, timeSeries]
    )

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        AUTOMATE_PERFORMANCE_FEATURE_FILENAME
    )
    return {
        files: {
            [fileName]: createCsv(
                formatPerformanceFeatureData(
                    AutomateStatsMeasureLabelMap,
                    timeSeriesExportableData.automatedInteractionByEventTypesTimeSeries
                )
            ),
        },
        fileName,
        isFetching: timeSeries.isFetching,
    }
}

export const fetchPerformanceByFeatureReport = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
    context: {
        isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined
        aiAgentUserId: string | undefined
    }
) => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        AUTOMATE_PERFORMANCE_FEATURE_FILENAME
    )

    return fetchAutomateMetricsTimeSeries(
        statsFilters,
        userTimezone,
        granularity,
        context.isAutomateNonFilteredDenominatorInAutomationRate,
        context.aiAgentUserId
    ).then((result) => {
        const greyArea = calculateGreyArea(
            moment(statsFilters.period.start_datetime),
            moment(statsFilters.period.end_datetime)
        )
        const {exportableData: timeSeriesExportableData} =
            getTimeSeriesFormattedData(result, granularity, greyArea)

        return {
            files: {
                [fileName]: createCsv(
                    formatPerformanceFeatureData(
                        AutomateStatsMeasureLabelMap,
                        timeSeriesExportableData.automatedInteractionByEventTypesTimeSeries
                    )
                ),
            },
            fileName,
            isLoading: false,
        }
    })
}

const useImpactReport = (statsFilters: StatsFilters, userTimezone: string) => {
    const {
        automatedInteractionTrend,
        automationRateTrend,
        decreaseInFirstResponseTimeTrend,
        decreaseInResolutionTimeTrend,
    } = useAutomateMetricsTrend(statsFilters, userTimezone)

    const isFetching =
        automatedInteractionTrend.isFetching ||
        automationRateTrend.isFetching ||
        decreaseInFirstResponseTimeTrend.isFetching ||
        decreaseInResolutionTimeTrend.isFetching

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        AUTOMATE_IMPACT_FILENAME
    )
    return {
        files: {
            [fileName]: createCsv(
                formatImpactReport({
                    firstResponseTimeTrend: decreaseInFirstResponseTimeTrend,
                    decreaseInResolutionTimeWithAutomationTrend:
                        decreaseInResolutionTimeTrend,
                    automationRateTrend,
                    automatedInteractionTrend,
                })
            ),
        },
        fileName,
        isFetching,
    }
}

export const useAutomateOverviewReportData = () => {
    const {statsFilters, userTimezone, granularity} = useNewAutomateFilters()
    const impactReport = useImpactReport(statsFilters, userTimezone)
    const performanceReport = useAutomatePerformanceReport(
        statsFilters,
        userTimezone,
        granularity
    )
    const performanceByFeatureReport = usePerformanceByFeatureReport(
        statsFilters,
        userTimezone,
        granularity
    )

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        OVERVIEW_METRICS_FILENAME
    )
    return {
        files: {
            ...impactReport.files,
            ...performanceReport.files,
            ...performanceByFeatureReport.files,
        },
        fileName,
        isLoading:
            performanceReport.isFetching ||
            performanceByFeatureReport.isFetching ||
            impactReport.isFetching,
    }
}
