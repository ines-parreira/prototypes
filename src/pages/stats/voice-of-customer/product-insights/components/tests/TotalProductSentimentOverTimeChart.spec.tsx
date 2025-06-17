import { render } from '@testing-library/react'

import { useTotalProductSentimentTimeSeries } from 'hooks/reporting/voice-of-customer/useTotalProductSentimentTimeSeries'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { BarChart } from 'pages/stats/common/components/charts/BarChart/BarChart'
import {
    CHART_COLORS,
    TOTAL_PRODUCTS_SENTIMENTS_CHART_FIELDS,
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
        {
            label: TOTAL_PRODUCTS_SENTIMENTS_CHART_FIELDS[0].label,
            values: [
                { x: '2023-02-27T00:00:00.000', y: 6 },
                { x: '2023-03-06T00:00:00.000', y: 21 },
            ],
            isDisabled: false,
        },
        {
            label: TOTAL_PRODUCTS_SENTIMENTS_CHART_FIELDS[1].label,
            values: [
                { x: '2023-02-27T00:00:00.000', y: 6 },
                { x: '2023-03-06T00:00:00.000', y: 21 },
            ],
            isDisabled: false,
        },
    ]

    const useTotalProductSentimentReturnValue: ReturnType<
        typeof useTotalProductSentimentTimeSeries
    > = {
        data,
        isFetching: false,
        isError: false,
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
                data: data,
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
