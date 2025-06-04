import { useAIIntentsTimeSeries } from 'hooks/reporting/voice-of-customer/useAIIntentsTimeSeries'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { formatLabeledTimeSeriesData } from 'pages/stats/common/utils'
import { LINES_COLORS } from 'pages/stats/constants'

export const TopAIIntentsOverTimeGraph = () => {
    const {
        data,
        legendInfo,
        legendDatasetVisibility,
        granularity,
        isFetching,
    } = useAIIntentsTimeSeries()

    return (
        <LineChart
            isLoading={isFetching}
            customColors={LINES_COLORS}
            data={formatLabeledTimeSeriesData(
                data,
                legendInfo.tooltips,
                granularity,
            )}
            displayLegend
            toggleLegend
            legendOnLeft
            skeletonHeight={328}
            defaultDatasetVisibility={legendDatasetVisibility}
            options={{
                scales: {
                    y: {
                        ticks: {
                            precision: 0,
                        },
                    },
                },
            }}
        />
    )
}
