import { render } from '@testing-library/react'

import { useAIIntentsTimeSeries } from 'hooks/reporting/voice-of-customer/useAIIntentsTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import ChartCard from 'pages/stats/common/components/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { formatLabeledTimeSeriesData } from 'pages/stats/common/utils'
import { LINES_COLORS } from 'pages/stats/constants'
import { TopAIIntentsOverTimeChart } from 'pages/stats/voice-of-customer/product-insights/charts/TopAIIntentsOverTimeChart'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/voice-of-customer/useAIIntentsTimeSeries')
const useIntentsOverTimeTimeSeriesMock = assumeMock(useAIIntentsTimeSeries)
jest.mock('pages/stats/common/components/charts/LineChart/LineChart')
const LineChartMock = assumeMock(LineChart)
jest.mock('pages/stats/common/components/ChartCard')
const ChartCardMock = assumeMock(ChartCard)

describe('TopAIIntentsOverTimeChart', () => {
    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TopAIIntentsOverTimeChart
        ]

    const data = [
        [
            { dateTime: '2023-02-27T00:00:00.000', value: 6 },
            { dateTime: '2023-03-06T00:00:00.000', value: 21 },
        ],
        [
            { dateTime: '2023-03-24T00:00:00.000', value: 10 },
            { dateTime: '2023-04-05T00:00:00.000', value: 5 },
        ],
    ]

    const useTopAIIntentsOverTimeReturnValue: ReturnType<
        typeof useAIIntentsTimeSeries
    > = {
        data: data,
        granularity: ReportingGranularity.Month,
        isFetching: false,
        legendDatasetVisibility: { 0: true },
        legendInfo: {
            labels: ['Level1', 'Level2'],
            tooltips: ['Level1 > Level2'],
        },
    }

    useIntentsOverTimeTimeSeriesMock.mockReturnValue(
        useTopAIIntentsOverTimeReturnValue,
    )

    LineChartMock.mockImplementation(() => <div>LineChart</div>)
    ChartCardMock.mockImplementation(({ children }) => <div>{children}</div>)

    it('should render the chart', () => {
        render(<TopAIIntentsOverTimeChart />)

        expect(LineChartMock).toHaveBeenCalledWith(
            {
                customColors: LINES_COLORS,
                data: formatLabeledTimeSeriesData(
                    data,
                    useTopAIIntentsOverTimeReturnValue.legendInfo.tooltips,
                    useTopAIIntentsOverTimeReturnValue.granularity,
                ),
                defaultDatasetVisibility:
                    useTopAIIntentsOverTimeReturnValue.legendDatasetVisibility,
                displayLegend: true,
                isLoading: false,
                legendOnLeft: true,
                options: {
                    scales: {
                        y: {
                            ticks: {
                                precision: 0,
                            },
                        },
                    },
                },
                skeletonHeight: 328,
                toggleLegend: true,
            },
            {},
        )
    })

    it('should render title & tooltip', () => {
        render(<TopAIIntentsOverTimeChart />)

        expect(ChartCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: title,
                hint: hint,
            }),
            {},
        )
    })

    it('should render loading state', () => {
        useIntentsOverTimeTimeSeriesMock.mockReturnValue({
            ...useTopAIIntentsOverTimeReturnValue,
            isFetching: true,
        })

        render(<TopAIIntentsOverTimeChart />)

        expect(LineChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })
})
