import { render } from '@testing-library/react'

import { useTotalProductSentimentTimeSeries } from 'hooks/reporting/voice-of-customer/useTotalProductSentimentTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { BarChart } from 'pages/stats/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'pages/stats/common/utils'
import {
    CHART_COLORS,
    CHART_FIELDS,
    TotalProductSentimentOverTimeChart,
} from 'pages/stats/voice-of-customer/product-insights/components/TotalProductSentimentOverTimeChart'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { assumeMock } from 'utils/testing'

jest.mock(
    'hooks/reporting/voice-of-customer/useTotalProductSentimentTimeSeries',
)
const useTotalProductSentimentTimeSeriesMock = assumeMock(
    useTotalProductSentimentTimeSeries,
)

jest.mock('pages/stats/common/components/charts/BarChart/BarChart')
const BarChartMock = assumeMock(BarChart)
jest.mock('pages/stats/common/components/ChartCard')
const ChartCardMock = assumeMock(ChartCard)

describe('TotalProductSentimentOverTimeChart', () => {
    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TotalProductSentimentOverTimeChart
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

    const useTotalProductSentimentReturnValue: ReturnType<
        typeof useTotalProductSentimentTimeSeries
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

    useTotalProductSentimentTimeSeriesMock.mockReturnValue(
        useTotalProductSentimentReturnValue,
    )

    BarChartMock.mockImplementation(() => <div>BarChart</div>)
    ChartCardMock.mockImplementation(({ children }) => <div>{children}</div>)

    it('should render the chart', () => {
        render(<TotalProductSentimentOverTimeChart />)

        expect(BarChartMock).toHaveBeenCalledWith(
            {
                _displayLegacyTooltip: true,
                customColors: CHART_COLORS,
                data: formatLabeledTimeSeriesData(
                    data,
                    CHART_FIELDS.map((metric) => metric.label),
                    useTotalProductSentimentReturnValue.granularity,
                ),
                displayLegend: true,
                hasBackground: true,
                isLoading: false,
                isStacked: true,
                legendOnLeft: true,
            },
            {},
        )
    })

    it('should render title & tooltip', () => {
        render(<TotalProductSentimentOverTimeChart />)

        expect(ChartCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: title,
                hint: hint,
            }),
            {},
        )
    })

    it('should render loading state', () => {
        useTotalProductSentimentTimeSeriesMock.mockReturnValue({
            ...useTotalProductSentimentReturnValue,
            isFetching: true,
        })

        render(<TotalProductSentimentOverTimeChart />)

        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })
})
