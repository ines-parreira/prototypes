import { useAIIntentsTimeSeries } from 'domains/reporting/hooks/voice-of-customer/useAIIntentsTimeSeries'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatLabeledTimeSeriesData } from 'domains/reporting/pages/common/utils'
import { LINES_COLORS } from 'domains/reporting/pages/constants'

export const TopAIIntentsOverTimeGraph = ({
    intentCustomFieldId,
}: {
    intentCustomFieldId: number
}) => {
    const {
        data,
        legendInfo,
        legendDatasetVisibility,
        granularity,
        isFetching,
    } = useAIIntentsTimeSeries(intentCustomFieldId)

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
