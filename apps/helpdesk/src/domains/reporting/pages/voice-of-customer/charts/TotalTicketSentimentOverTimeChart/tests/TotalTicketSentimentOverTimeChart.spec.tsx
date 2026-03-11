import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useSentimentsCustomFieldsTimeSeries } from 'domains/reporting/hooks/useCustomFieldsTimeSeries'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { BarChart } from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { TotalTicketSentimentOverTimeChart } from 'domains/reporting/pages/voice-of-customer/charts/TotalTicketSentimentOverTimeChart/TotalTicketSentimentOverTimeChart'
import {
    CHART_COLORS,
    TOTAL_PRODUCTS_SENTIMENTS_CHART_FIELDS,
} from 'domains/reporting/pages/voice-of-customer/charts/TotalTicketSentimentOverTimeChart/TotalTicketSentimentOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

jest.mock('domains/reporting/hooks/useCustomFieldsTimeSeries')
const useSentimentsCustomFieldsTimeSeriesMock = assumeMock(
    useSentimentsCustomFieldsTimeSeries,
)

jest.mock('domains/reporting/pages/common/components/charts/BarChart/BarChart')
const BarChartMock = assumeMock(BarChart)
jest.mock('domains/reporting/pages/common/components/ChartCard')
const ChartCardMock = assumeMock(ChartCard)
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

describe('TotalTicketSentimentOverTimeChart', () => {
    const intentCustomFieldId = 123
    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TotalTicketSentimentOverTimeChart
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
        typeof useSentimentsCustomFieldsTimeSeries
    > = {
        data,
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        useSentimentsCustomFieldsTimeSeriesMock.mockReturnValue(
            useTotalProductSentimentReturnValue,
        )

        BarChartMock.mockImplementation(() => <div>BarChart</div>)
        ChartCardMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: 123,
            intentCustomFieldId: intentCustomFieldId,
            outcomeCustomFieldId: 789,
            isLoading: false,
        })
    })

    it('should render the chart', () => {
        render(<TotalTicketSentimentOverTimeChart />)

        expect(BarChartMock).toHaveBeenCalledWith(
            {
                customColors: CHART_COLORS,
                data: data,
                displayLegend: true,
                hasBackground: true,
                isLoading: false,
                isStacked: true,
                legendOnLeft: true,
                withTooltipTotal: true,
            },
            {},
        )
    })

    it('should render title & tooltip', () => {
        render(<TotalTicketSentimentOverTimeChart />)

        expect(ChartCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: title,
                hint: hint,
            }),
            {},
        )
    })

    it('should render loading state', () => {
        useSentimentsCustomFieldsTimeSeriesMock.mockReturnValue({
            ...useTotalProductSentimentReturnValue,
            isFetching: true,
        })

        render(<TotalTicketSentimentOverTimeChart />)

        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })
})
