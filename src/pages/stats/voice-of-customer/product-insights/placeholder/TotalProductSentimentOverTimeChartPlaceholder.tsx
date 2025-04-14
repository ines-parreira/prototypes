import analyticsColors from 'assets/css/new/stats/modern.json'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { TimeSeriesPerDimension } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { BarChart } from 'pages/stats/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'pages/stats/common/utils'

export const CHART_TITLE = 'Total product sentiment over time'
export const CHART_HINT = 'Total product sentiment over time'

const CHART_COLORS = [
    analyticsColors['analytics'].data.blue.value,
    analyticsColors['analytics'].data.pink.value,
]

enum Sentiment {
    Positive = 'positive',
    Negative = 'negative',
}

export const CHART_FIELDS = [
    {
        field: Sentiment.Positive,
        label: 'Positive',
    },
    {
        field: Sentiment.Negative,
        label: 'Negative',
    },
]

const useMockedData = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): { data: TimeSeriesPerDimension; isLoading: boolean } => {
    return {
        data: {
            [Sentiment.Positive]: [
                [
                    {
                        dateTime: `${filters.period.start_datetime}`,
                        value: 4,
                        label: `${timezone}${granularity}`,
                    },
                    {
                        dateTime: `${filters.period.end_datetime}`,
                        value: 6,
                        label: `${timezone}${granularity}`,
                    },
                ],
            ],
            [Sentiment.Negative]: [
                [
                    {
                        dateTime: `${filters.period.start_datetime}`,
                        value: 3,
                        label: `${timezone}${granularity}`,
                    },
                    {
                        dateTime: `${filters.period.end_datetime}`,
                        value: 9,
                        label: `${timezone}${granularity}`,
                    },
                ],
            ],
        },
        isLoading: false,
    }
}

export const TotalProductSentimentOverTimeChartPlaceholder = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data, isLoading } = useMockedData(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )
    const formattedData = CHART_FIELDS.map((metric) => metric.field).map(
        (metric) => (data[metric] ? data[metric][0] : []),
    )

    return (
        <ChartCard title={CHART_TITLE} hint={{ title: CHART_HINT }}>
            <BarChart
                data={formatLabeledTimeSeriesData(
                    formattedData,
                    CHART_FIELDS.map((metric) => metric.label),
                    granularity,
                )}
                isStacked={true}
                isLoading={isLoading}
                hasBackground
                _displayLegacyTooltip
                displayLegend
                legendOnLeft
                customColors={CHART_COLORS}
            />
        </ChartCard>
    )
}
