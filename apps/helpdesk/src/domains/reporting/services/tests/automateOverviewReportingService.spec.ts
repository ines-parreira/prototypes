import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import { AutomateStatsMeasureLabelMap } from 'domains/reporting/hooks/automate/automateStatsMeasureLabelMap'
import { AutomateTrendMetrics } from 'domains/reporting/hooks/automate/types'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import {
    fetchAutomateMetricsTimeSeries,
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'domains/reporting/hooks/automate/useAutomationDataset'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { AutomationBillingEventMeasure } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
} from 'domains/reporting/pages/self-service/constants'
import {
    AUTOMATE_IMPACT_FILENAME,
    AUTOMATE_PERFORMANCE_FEATURE_FILENAME,
    AUTOMATE_PERFORMANCE_FILENAME,
    fetchAutomatePerformanceReport,
    fetchPerformanceByFeatureReport,
    formatPerformanceFeatureData,
    formatPerformanceReportData,
    OVERVIEW_METRICS_FILENAME,
    useAutomateOverviewReportData,
} from 'domains/reporting/services/automateOverviewReportingService'
import {
    CURRENT_PERIOD_LABEL,
    EMPTY_LABEL,
    PREVIOUS_PERIOD_LABEL,
} from 'domains/reporting/services/constants'
import {
    DECREASE_IN_FIRST_RESPONSE,
    DECREASE_IN_RESOLUTION_TIME,
} from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
const useNewAutomateFiltersMock = assumeMock(useAutomateFilters)

jest.mock('domains/reporting/hooks/automate/useAutomationDataset')
const useAutomateMetricsTrendMock = assumeMock(useAutomateMetricsTrend)
const useAutomateMetricsTimeSeriesV2Mock = assumeMock(
    useAutomateMetricsTimeSeries,
)
const fetchAutomateMetricsTimeSeriesMock = assumeMock(
    fetchAutomateMetricsTimeSeries,
)

const buildQuery = <T>(isFetching: boolean, data?: T) => ({
    isFetching,
    data,
    isError: false,
})

describe('reporting', () => {
    const trendReportData = {
        prevValue: 1,
        value: 2,
    }
    const featureLabel =
        AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent
    const timeSeriesData = {
        dateTime: moment().toISOString(),
        value: 4,
        label: featureLabel,
    }

    const trendData = {
        [AutomateTrendMetrics.DecreaseInResolutionTime]: buildQuery(
            false,
            trendReportData,
        ),
        [AutomateTrendMetrics.DecreaseInFirstResponseTime]: buildQuery(
            false,
            trendReportData,
        ),
        [AutomateTrendMetrics.AutomationRate]: buildQuery(
            false,
            trendReportData,
        ),
        [AutomateTrendMetrics.Interactions]: buildQuery(false, trendReportData),
    }
    const timeSeries = {
        automationRateTimeSeries: [[timeSeriesData]],
        automatedInteractionTimeSeries: [[timeSeriesData]],
        automatedInteractionByEventTypesTimeSeries: [[timeSeriesData]],
        isFetching: false,
        isError: false,
    }
    const period = {
        start_datetime: '2023-06-07',
        end_datetime: '2023-06-14',
    }
    const impactReportFileName = getCsvFileNameWithDates(
        period,
        AUTOMATE_IMPACT_FILENAME,
    )
    const performanceReportFileName = getCsvFileNameWithDates(
        period,
        AUTOMATE_PERFORMANCE_FILENAME,
    )
    const performanceByFeatureReportFileName = getCsvFileNameWithDates(
        period,
        AUTOMATE_PERFORMANCE_FEATURE_FILENAME,
    )
    const reportGroupFileName = getCsvFileNameWithDates(
        period,
        OVERVIEW_METRICS_FILENAME,
    )

    beforeEach(() => {
        useNewAutomateFiltersMock.mockReturnValue({
            granularity: ReportingGranularity.Day,
            statsFilters: { period },
            userTimezone: 'UTC',
        })
        useAutomateMetricsTrendMock.mockReturnValue(trendData)
        useAutomateMetricsTimeSeriesV2Mock.mockReturnValue(timeSeries)
    })

    it('should call saveReport with a report', () => {
        const { result } = renderHook(() => useAutomateOverviewReportData())

        expect(result.current).toEqual({
            files: {
                [impactReportFileName]: createCsv([
                    [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
                    [
                        AUTOMATION_RATE_LABEL,
                        trendReportData.value,
                        trendReportData.prevValue,
                    ],
                    [
                        AUTOMATED_INTERACTIONS_LABEL,
                        trendReportData.value,
                        trendReportData.prevValue,
                    ],
                    [
                        DECREASE_IN_FIRST_RESPONSE,
                        trendReportData.value,
                        trendReportData.prevValue,
                    ],
                    [
                        DECREASE_IN_RESOLUTION_TIME,
                        trendReportData.value,
                        trendReportData.prevValue,
                    ],
                ]),
                [performanceReportFileName]: createCsv([
                    [
                        EMPTY_LABEL,
                        AUTOMATED_INTERACTIONS_LABEL,
                        AUTOMATION_RATE_LABEL,
                    ],
                    [
                        timeSeriesData.dateTime,
                        timeSeriesData.value,
                        timeSeriesData.value,
                    ],
                ]),
                [performanceByFeatureReportFileName]: createCsv([
                    [EMPTY_LABEL, AutomateStatsMeasureLabelMap[featureLabel]],
                    [timeSeriesData.dateTime, timeSeriesData.value],
                ]),
            },
            fileName: reportGroupFileName,
            isLoading: false,
        })
    })

    it('should call saveReport with some base query values unset', () => {
        const emptyTrendData = {
            [AutomateTrendMetrics.DecreaseInResolutionTime]: buildQuery(false, {
                ...trendReportData,
                value: null,
                prevValue: null,
            }),
            [AutomateTrendMetrics.DecreaseInFirstResponseTime]: buildQuery(
                false,
                {
                    ...trendReportData,
                    value: null,
                    prevValue: null,
                },
            ),
            [AutomateTrendMetrics.AutomationRate]: buildQuery(false, {
                ...trendReportData,
                value: null,
                prevValue: null,
            }),
            [AutomateTrendMetrics.Interactions]: buildQuery(false, {
                ...trendReportData,
                value: null,
                prevValue: null,
            }),
        }
        const emptyTimeSeries = {
            automationRateTimeSeries: [],
            automatedInteractionTimeSeries: [],
            automatedInteractionByEventTypesTimeSeries: [],
            isFetching: false,
            isError: false,
        }

        useAutomateMetricsTrendMock.mockReturnValue(emptyTrendData)
        useAutomateMetricsTimeSeriesV2Mock.mockReturnValue(emptyTimeSeries)

        const { result } = renderHook(() => useAutomateOverviewReportData())

        expect(result.current).toEqual({
            files: {
                [impactReportFileName]: createCsv([
                    [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
                    [AUTOMATION_RATE_LABEL, 0, 0],
                    [AUTOMATED_INTERACTIONS_LABEL, 0, 0],
                    [DECREASE_IN_FIRST_RESPONSE, 0, 0],
                    [DECREASE_IN_RESOLUTION_TIME, 0, 0],
                ]),
                [performanceReportFileName]: createCsv([
                    [
                        EMPTY_LABEL,
                        AUTOMATED_INTERACTIONS_LABEL,
                        AUTOMATION_RATE_LABEL,
                    ],
                ]),
                [performanceByFeatureReportFileName]: createCsv([
                    [EMPTY_LABEL],
                ]),
            },
            fileName: reportGroupFileName,
            isLoading: false,
        })
    })

    describe('fetchPerformanceByFeatureReport', () => {
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: '2024-12-11',
                end_datetime: '2024-12-11',
            },
        }
        const timezone = 'UTC'
        const granularity = ReportingGranularity.Day
        const context = {
            aiAgentUserId: 123,
        }
        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            AUTOMATE_PERFORMANCE_FEATURE_FILENAME,
        )

        beforeEach(() => {
            fetchAutomateMetricsTimeSeriesMock.mockResolvedValue(timeSeries)
        })

        it('should fetch data and return formatted report', async () => {
            const response = await fetchPerformanceByFeatureReport(
                statsFilters,
                timezone,
                granularity,
                context,
            )

            expect(response).toEqual({
                files: {
                    [fileName]: createCsv(
                        formatPerformanceFeatureData(
                            AutomateStatsMeasureLabelMap,
                            timeSeries.automatedInteractionTimeSeries,
                        ),
                    ),
                },
                fileName,
                isLoading: false,
            })
        })
    })

    describe('fetchAutomatePerformanceReport', () => {
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: '2024-12-11',
                end_datetime: '2024-12-11',
            },
        }
        const timezone = 'UTC'
        const granularity = ReportingGranularity.Day
        const context = {
            aiAgentUserId: 123,
        }
        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            AUTOMATE_PERFORMANCE_FILENAME,
        )

        beforeEach(() => {
            fetchAutomateMetricsTimeSeriesMock.mockResolvedValue(timeSeries)
        })

        it('should fetch and format report', async () => {
            const result = await fetchAutomatePerformanceReport(
                statsFilters,
                timezone,
                granularity,
                context,
            )

            expect(result).toEqual({
                files: {
                    [fileName]: createCsv(
                        formatPerformanceReportData(timeSeries),
                    ),
                },
                fileName,
                isLoading: false,
            })
        })
    })
})
